import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/features/calendar/hooks";
import { boardFilters, boardScope } from "@/features/saved-filters/board";
import {
  definitionsEqual,
  EMPTY_FILTER_STATE,
  toDefinition,
  type FilterState,
} from "@/features/saved-filters/filter-definition";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import { useSavedFiltersQuery } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import type { Board, SavedFilter } from "@/features/saved-filters/saved-filter-types";
import {
  draftStorageKey,
  type FilterSlot,
} from "@/features/task-filters/hooks/useFilterSlotState";
import { useTaskFilters } from "@/features/task-filters/hooks/useTaskFilters";

/**
 * Whether a saved filter has unsaved edits on a board. Reads the stored draft
 * directly so the quick-filter bar can mark chips that aren't active.
 */
const draftDiffers = (scope: string, filter: SavedFilter): boolean => {
  try {
    const raw = window.localStorage.getItem(draftStorageKey(scope, filter.ID));
    if (!raw) return false;
    const draft = JSON.parse(raw) as FilterState | null;
    return !!draft && !definitionsEqual(toDefinition(draft), filter.Definition);
  } catch {
    return false;
  }
};

/**
 * Whether the board's scratch filter narrows anything, read from storage so
 * its chip can say "Unsaved filter" even while a saved filter is active.
 */
const scratchHasFilters = (scope: string): boolean => {
  try {
    const basic = JSON.parse(window.localStorage.getItem(`aycorn.${scope}.filters`) ?? "{}") as Record<string, unknown>;
    const conditions = JSON.parse(window.localStorage.getItem(`aycorn.${scope}.conditions`) ?? "null") as
      | { root?: { children?: unknown[] } }
      | null;
    const anyValues = Object.entries(basic).some(([key, value]) =>
      key === "dates"
        ? Object.entries((value ?? {}) as Record<string, unknown>).some(
            ([k, v]) => k.endsWith("Mode") && v !== "all",
          )
        : Array.isArray(value) && value.length > 0,
    );
    return anyValues || (conditions?.root?.children?.length ?? 0) > 0;
  } catch {
    return false;
  }
};

/**
 * One board's filtering: its pinned saved filters, which one is active, and
 * the editing state of that filter (or of the board's scratch filter when
 * none is). Spreads the full `useTaskFilters` API, so drawers and queries use
 * it exactly as before.
 *
 * Saved filters are edited as local drafts: changes apply immediately and
 * persist per board and filter, and `save` commits them to the shared filter.
 * The active filter falls back to scratch if it's deleted or unpinned.
 */
export function useBoardFilter(board: Board) {
  const scope = boardScope(board);
  const { data: savedFilters = [], isPending } = useSavedFiltersQuery();
  const mutations = useSavedFilterMutations();
  const pinned = boardFilters(savedFilters, board);

  const [activeId, setActiveId] = useLocalStorage<number | null>(
    `aycorn.${scope}.activeFilter`,
    null,
  );
  const active = pinned.find((f) => f.ID === activeId) ?? null;

  const slot: FilterSlot = active
    ? { kind: "saved", id: active.ID, definition: active.Definition }
    : { kind: "scratch" };
  const filtersApi = useTaskFilters(scope, slot);

  // A remembered filter that's gone (deleted, or unpinned elsewhere) falls
  // back to scratch, and its orphaned draft is dropped.
  useEffect(() => {
    if (isPending || activeId === null || active) return;
    window.localStorage.removeItem(draftStorageKey(scope, activeId));
    setActiveId(null);
  }, [isPending, activeId, active, scope, setActiveId]);

  const isDirty = !!active && filtersApi.hasDraft &&
    !definitionsEqual(toDefinition(filtersApi.filterState), active.Definition);

  /** Commits the active filter's draft to the shared filter. */
  const save = async () => {
    if (!active) return;
    try {
      await mutations.update.mutateAsync({
        id: active.ID,
        patch: { definition: toDefinition(filtersApi.filterState) },
      });
      filtersApi.clearDraft();
      toast.success(`Saved “${active.Name}”.`);
    } catch {
      toast.error("Couldn't save the filter. Try again.");
    }
  };

  /**
   * Saves the current state as a new filter, pinned here and made active.
   * Promoting the scratch filter empties it; forking a saved filter leaves the
   * original's committed definition as it was.
   */
  const saveAsNew = async (name: string) => {
    const definition = toDefinition(filtersApi.filterState);
    try {
      const created = await mutations.create.mutateAsync({ name, definition, pin: board });
      if (active) filtersApi.clearDraft();
      else filtersApi.replaceFilterState(EMPTY_FILTER_STATE);
      setActiveId(created.ID);
      toast.success(`Saved “${created.Name}”.`);
    } catch {
      toast.error("Couldn't save the filter. Try again.");
    }
  };

  const discard = () => filtersApi.clearDraft();

  /** Switches the board to a pinned filter, or to scratch with `null`. */
  const activate = (id: number | null) => setActiveId(id);

  const pin = async (id: number) => {
    try {
      await mutations.pin.mutateAsync({ id, board });
      setActiveId(id);
    } catch {
      toast.error("Couldn't add the filter. Try again.");
    }
  };

  const unpin = async (id: number) => {
    try {
      await mutations.unpin.mutateAsync({ id, board });
    } catch {
      toast.error("Couldn't remove the filter. Try again.");
    }
  };

  const rename = async (id: number, name: string) => {
    try {
      await mutations.update.mutateAsync({ id, patch: { name } });
    } catch {
      toast.error("Couldn't rename the filter. Try again.");
    }
  };

  const reorder = (ids: number[]) =>
    mutations.reorder.mutate(
      { board, ids },
      { onError: () => toast.error("Couldn't reorder filters. Try again.") },
    );

  return {
    ...filtersApi,
    board,
    savedFilters,
    pinned,
    active,
    isDirty,
    /** False while a remembered filter is still loading, so queries don't fetch the wrong state first. */
    filtersReady: !(isPending && activeId !== null),
    /** The scratch chip's label: "All tasks" when it filters nothing. */
    scratchLabel:
      (active ? scratchHasFilters(scope) : filtersApi.activeFilterCount() > 0)
        ? "Unsaved filter"
        : "All tasks",
    hasUnsavedEdits: (filter: SavedFilter) =>
      filter.ID === active?.ID ? isDirty : draftDiffers(scope, filter),
    activate,
    save,
    saveAsNew,
    discard,
    pin,
    unpin,
    rename,
    reorder,
  };
}

export type BoardFilterAPI = ReturnType<typeof useBoardFilter>;
