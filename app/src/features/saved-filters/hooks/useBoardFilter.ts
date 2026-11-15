import { useMemo } from "react";
import { boardScope } from "@/features/saved-filters/board";
import { useAdhocConditions } from "@/features/saved-filters/hooks/useAdhocConditions";
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
  const adhocConditions = useAdhocConditions(adhocScope);

  /** Saves the ad-hoc filters as a new quick filter (toggled on) and clears them. */
  const saveAdhocAsQuickFilter = async (name: string) => {
    const root = { ...createRoot(), children: basicToConditions(adhoc.persisted) };
    const created = await quick.create(name, root);
    if (!created) return;
    adhoc.resetAll();
  };

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

  return {
    ...adhoc,
    board,
    quick,
    /** The Filter popover's unsaved condition tree, remembered per view. */
    adhocConditions,
    saveAdhocConditionsAsQuickFilter,
    /** Condition trees for the request: the Filter popover's, then one per toggled quick filter. */
    conditionWires,
    filtersReady: quick.ready,
    saveAdhocAsQuickFilter,
  };
}

export type BoardFilterAPI = ReturnType<typeof useBoardFilter>;
