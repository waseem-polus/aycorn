import { useMemo } from "react";
import { boardScope } from "@/features/saved-filters/board";
import { useAdhocConditions } from "@/features/saved-filters/hooks/useAdhocConditions";
import { useBoardSavedFilters } from "@/features/saved-filters/hooks/useBoardSavedFilters";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { useTaskSearch } from "@/features/task-filters/hooks/useTaskSearch";

/**
 * One board's filtering, in two independent layers that the server ANDs:
 *
 * - `adhocConditions`: the Filter popover's unsaved condition tree, kept under
 *   `adhocScope` — each view remembers its own — and
 * - `saved`: the saved filters pinned to the board, any number toggled on at once.
 *
 * Plus the search term, which is applied separately. `saveAdhocConditionsAsSavedFilter`
 * promotes the popover's tree into a saved filter.
 */
export function useBoardFilter(board: Board, adhocScope: string = boardScope(board)) {
  const { search, setSearch } = useTaskSearch();
  const saved = useBoardSavedFilters(board);
  const adhocConditions = useAdhocConditions(adhocScope);

  /** Saves the Filter popover's tree as a new saved filter (pinned and toggled on) and clears it. */
  const saveAdhocConditionsAsSavedFilter = async (name: string) => {
    const created = await saved.create(name, adhocConditions.tree);
    if (!created) return;
    adhocConditions.clear();
  };

  const conditionWires = useMemo(
    () => (adhocConditions.wire ? [adhocConditions.wire, ...saved.wires] : saved.wires),
    [adhocConditions.wire, saved.wires],
  );

  /** How many filters are narrowing the list: the popover's conditions plus toggled saved filters. */
  const activeFilterCount = () => adhocConditions.count + saved.active.length;

  /** Clears the popover's conditions, toggled saved filters and the search. */
  const resetAll = () => {
    adhocConditions.clear();
    saved.clearAll();
    setSearch("");
  };

  return {
    search,
    setSearch,
    board,
    saved,
    /** The Filter popover's unsaved condition tree, remembered per view. */
    adhocConditions,
    saveAdhocConditionsAsSavedFilter,
    /** Condition trees for the request: the Filter popover's, then one per toggled saved filter. */
    conditionWires,
    filtersReady: saved.ready,
    activeFilterCount,
    resetAll,
  };
}

export type BoardFilterAPI = ReturnType<typeof useBoardFilter>;
