import { useState } from "react";
import { toast } from "sonner";
import { EMPTY_FILTER_STATE } from "@/features/saved-filters/filter-definition";
import {
  UNDO_TOAST_MS,
  useConditionTree,
} from "@/features/task-filters/conditions/hooks/useConditionTree";
import {
  useFilterSlotState,
  type FilterSlot,
} from "@/features/task-filters/hooks/useFilterSlotState";
import {
  EMPTY_FILTERS,
  FILTER_DIMS,
  type DateFilterMode,
  type DateModeKey,
  type FilterDim,
  type PersistedFilterState,
  type TaskFilterState,
} from "@/features/task-filters/task-filters";

const stripSearch = (state: TaskFilterState): PersistedFilterState => {
  const rest = { ...state };
  delete (rest as Partial<TaskFilterState>).search;
  return rest;
};

const SCRATCH: FilterSlot = { kind: "scratch" };

/**
 * Task filter state for one surface. `scope` names the surface — it keys the
 * localStorage entry, so "upcoming" and "project.7" remember their filters
 * independently.
 *
 * `search` is deliberately excluded from persistence: a search term left over
 * from a previous session looks like missing data ("only 1-2 tasks") when the
 * page is reopened, so it lives in plain component state and resets on mount.
 *
 * `slot` picks which filter is being edited — the board's scratch filter or a
 * saved filter's draft (see `useFilterSlotState`). The editing API is the
 * same either way, so the drawers don't know the difference.
 *
 * `conditions` is the advanced condition tree, persisted alongside under the
 * same scope. The server ANDs it with the basic filters, and it counts toward
 * `activeFilterCount` and is cleared by `resetAll` like any other filter.
 */
export function useTaskFilters(scope: string, slot: FilterSlot = SCRATCH) {
  const slotState = useFilterSlotState(scope, slot);
  const persisted = slotState.state.basic;
  const setPersisted = slotState.setBasic;
  const [search, setSearchState] = useState("");
  const conditions = useConditionTree(slotState.state.root, slotState.setRoot);
  const filters: TaskFilterState = { ...persisted, search };

  const setFilters = (
    update: TaskFilterState | ((prev: TaskFilterState) => TaskFilterState),
  ) => {
    setPersisted((prev: PersistedFilterState) => {
      const next =
        typeof update === "function"
          ? update({ ...prev, search })
          : update;
      return stripSearch(next);
    });
  };

  const toggleFilter = (dim: FilterDim, key: string | number) => {
    setFilters((prev: TaskFilterState) => {
      const cur = (prev[dim] as (string | number)[]) ?? [];
      const next = cur.includes(key as never)
        ? cur.filter((k) => k !== key)
        : [...cur, key];
      return { ...prev, [dim]: next };
    });
  };

  const clearFilterDim = (dim: FilterDim) => {
    setFilters((prev: TaskFilterState) => ({ ...prev, [dim]: [] }));
  };

  const setSearch = (search: string) => {
    setSearchState(search);
  };

  const setDateFilter = (key: string, value: string) => {
    setFilters((prev: TaskFilterState) => {
      if (value) return { ...prev, dates: { ...prev.dates, [key]: value } };
      const d = { ...prev.dates };
      delete d[key as keyof typeof d];
      delete d[(key + "HasTime") as keyof typeof d];
      return { ...prev, dates: d };
    });
  };

  const setHasTimeFilter = (key: string, value: boolean) => {
    setFilters((prev: TaskFilterState) => {
      if (!value) {
        const d = { ...prev.dates };
        delete d[key as keyof typeof d];
        return { ...prev, dates: d };
      }
      return { ...prev, dates: { ...prev.dates, [key]: value } };
    });
  };

  /**
   * Leaving "with" mode discards the range that was only meaningful there, so
   * returning to it starts from a clean picker. Mode and range are cleared in
   * one functional update — two `setFilters` calls in the same render would
   * overwrite each other.
   */
  const setDateMode = (
    modeKey: DateModeKey,
    mode: DateFilterMode,
    fromKey: string,
    toKey: string,
  ) => {
    setFilters((prev: TaskFilterState) => {
      const dates = { ...prev.dates, [modeKey]: mode };
      if (mode !== "with") {
        for (const key of [fromKey, toKey, fromKey + "HasTime", toKey + "HasTime"]) {
          delete dates[key as keyof typeof dates];
        }
      }
      return { ...prev, dates };
    });
  };

  /**
   * Clears basic filters, search and conditions. A condition tree can take a
   * while to build, so when one is discarded the reset is offered back.
   */
  const resetAll = () => {
    const snapshot = slotState.state;
    slotState.replace(EMPTY_FILTER_STATE);
    setSearchState("");
    if (snapshot.root.children.length === 0) return;
    toast("Filters reset", {
      duration: UNDO_TOAST_MS,
      action: { label: "Undo", onClick: () => slotState.replace(snapshot) },
    });
  };

  /**
   * How many filters are actually narrowing the list. `ignoreDateModes` lets a
   * surface leave out a date dimension it doesn't apply — the project page's
   * calendar views group by planned date, so their planned filter isn't sent.
   */
  const activeFilterCount = (opts?: { ignoreDateModes?: DateModeKey[] }): number => {
    const ignored = opts?.ignoreDateModes ?? [];
    let n = FILTER_DIMS.reduce(
      (acc, dim) => acc + ((filters[dim] as unknown[])?.length ?? 0),
      0,
    );
    for (const modeKey of ["plannedMode", "completedMode"] as DateModeKey[]) {
      if (ignored.includes(modeKey)) continue;
      if ((filters.dates?.[modeKey] ?? "all") !== "all") n++;
    }
    return n + conditions.completeCount;
  };

  return {
    filters,
    toggleFilter,
    clearFilterDim,
    setSearch,
    setDateFilter,
    setHasTimeFilter,
    setDateMode,
    resetAll,
    activeFilterCount,
    conditions,
    EMPTY_FILTERS,
    /** The slot's whole state, for saving it as a definition. */
    filterState: slotState.state,
    replaceFilterState: slotState.replace,
    hasDraft: slotState.hasDraft,
    clearDraft: slotState.clearDraft,
  };
}
