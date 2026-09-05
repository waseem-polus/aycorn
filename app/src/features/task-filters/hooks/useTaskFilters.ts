import { useState } from "react";
import { useLocalStorage } from "@/features/calendar/hooks";
import {
  EMPTY_FILTERS,
  FILTER_DIMS,
  type DateFilterMode,
  type DateModeKey,
  type FilterDim,
  type TaskFilterState,
} from "@/features/task-filters/task-filters";

type PersistedFilterState = Omit<TaskFilterState, "search">;

const stripSearch = (state: TaskFilterState): PersistedFilterState => {
  const rest = { ...state };
  delete (rest as Partial<TaskFilterState>).search;
  return rest;
};

const EMPTY_PERSISTED_FILTERS: PersistedFilterState = stripSearch(EMPTY_FILTERS);

/**
 * Task filter state for one surface. `scope` names the surface — it keys the
 * localStorage entry, so "upcoming" and "project.7" remember their filters
 * independently.
 *
 * `search` is deliberately excluded from persistence: a search term left over
 * from a previous session looks like missing data ("only 1-2 tasks") when the
 * page is reopened, so it lives in plain component state and resets on mount.
 */
export function useTaskFilters(scope: string) {
  const [persisted, setPersisted] = useLocalStorage<PersistedFilterState>(
    `aycorn.${scope}.filters`,
    EMPTY_PERSISTED_FILTERS,
  );
  const [search, setSearchState] = useState("");
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

  const resetAll = () => {
    setPersisted(EMPTY_PERSISTED_FILTERS);
    setSearchState("");
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
    return n;
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
    EMPTY_FILTERS,
  };
}
