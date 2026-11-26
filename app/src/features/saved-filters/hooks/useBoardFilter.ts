import { useMemo } from "react";
import { boardScope } from "@/features/saved-filters/board";
import { useAdhocConditions } from "@/features/saved-filters/hooks/useAdhocConditions";
import { useBoardSavedFilters } from "@/features/saved-filters/hooks/useBoardSavedFilters";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { useTaskSearch } from "@/features/task-filters/hooks/useTaskSearch";
import type { BoardView } from "@/features/views/view-types";

/**
 * The filtering of a board's current view, in two independent layers that the
 * server ANDs:
 *
 * - `adhocConditions`: the Filter popover's unsaved condition tree — each
 *   view remembers its own — and
 * - `saved`: the saved filters pinned to the view, any number toggled on at
 *   once (toggles carry across the board's views).
 *
 * Plus the search term, which is applied separately. `saveAdhocConditionsAsSavedFilter`
 * promotes the popover's tree into a saved filter.
 */
export function useBoardFilter(board: Board, view: BoardView | null) {
  const { search, setSearch } = useTaskSearch();
  const saved = useBoardSavedFilters(board, view);
  const adhocConditions = useAdhocConditions(
    view ? `${boardScope(board)}.view.${view.ID}` : boardScope(board),
  );

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
