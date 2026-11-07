import { boardScope } from "@/features/saved-filters/board";
import { useQuickFilters } from "@/features/saved-filters/hooks/useQuickFilters";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { basicToConditions } from "@/features/task-filters/conditions/basic-to-conditions";
import { createRoot } from "@/features/task-filters/conditions/condition-tree-ops";
import { useTaskFilters } from "@/features/task-filters/hooks/useTaskFilters";

/**
 * One board's filtering, in two independent layers that the server ANDs:
 *
 * - the ad-hoc drawer filters (spread at the top level, so the drawer, search
 *   and queries use them as before), kept under `adhocScope` — each view
 *   remembers its own — and
 * - `quick`: the pinned quick filters, any number toggled on at once.
 *
 * `saveAdhocAsQuickFilter` promotes the drawer's filters into a quick filter.
 */
export function useBoardFilter(board: Board, adhocScope: string = boardScope(board)) {
  const adhoc = useTaskFilters(adhocScope);
  const quick = useQuickFilters(board);

  /** Saves the ad-hoc filters as a new quick filter (toggled on) and clears them. */
  const saveAdhocAsQuickFilter = async (name: string) => {
    const root = { ...createRoot(), children: basicToConditions(adhoc.persisted) };
    const created = await quick.create(name, root);
    if (!created) return;
    adhoc.resetAll();
  };

  return {
    ...adhoc,
    board,
    quick,
    /** Condition trees for the request: one per toggled quick filter. */
    conditionWires: quick.wires,
    filtersReady: quick.ready,
    saveAdhocAsQuickFilter,
  };
}

export type BoardFilterAPI = ReturnType<typeof useBoardFilter>;
