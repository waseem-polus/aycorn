import { useMemo } from "react";
import { boardScope } from "@/features/saved-filters/board";
import { useAdhocConditions } from "@/features/saved-filters/hooks/useAdhocConditions";
import { useQuickFilters } from "@/features/saved-filters/hooks/useQuickFilters";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { useTaskSearch } from "@/features/task-filters/hooks/useTaskSearch";

/**
 * One board's filtering, in two independent layers that the server ANDs:
 *
 * - `adhocConditions`: the Filter popover's unsaved condition tree, kept under
 *   `adhocScope` — each view remembers its own — and
 * - `quick`: the pinned quick filters, any number toggled on at once.
 *
 * Plus the search term, which is applied separately. `saveAdhocConditionsAsQuickFilter`
 * promotes the popover's tree into a quick filter.
 */
export function useBoardFilter(board: Board, adhocScope: string = boardScope(board)) {
  const { search, setSearch } = useTaskSearch();
  const quick = useQuickFilters(board);
  const adhocConditions = useAdhocConditions(adhocScope);

  /** Saves the Filter popover's tree as a new quick filter (toggled on) and clears it. */
  const saveAdhocConditionsAsQuickFilter = async (name: string) => {
    const created = await quick.create(name, adhocConditions.tree);
    if (!created) return;
    adhocConditions.clear();
  };

  const conditionWires = useMemo(
    () => (adhocConditions.wire ? [adhocConditions.wire, ...quick.wires] : quick.wires),
    [adhocConditions.wire, quick.wires],
  );

  /** How many filters are narrowing the list: the popover's conditions plus toggled quick filters. */
  const activeFilterCount = () => adhocConditions.count + quick.active.length;

  /** Clears the popover's conditions, toggled quick filters and the search. */
  const resetAll = () => {
    adhocConditions.clear();
    quick.clearAll();
    setSearch("");
  };

  return {
    search,
    setSearch,
    board,
    quick,
    /** The Filter popover's unsaved condition tree, remembered per view. */
    adhocConditions,
    saveAdhocConditionsAsQuickFilter,
    /** Condition trees for the request: the Filter popover's, then one per toggled quick filter. */
    conditionWires,
    filtersReady: quick.ready,
    activeFilterCount,
    resetAll,
  };
}

export type BoardFilterAPI = ReturnType<typeof useBoardFilter>;
