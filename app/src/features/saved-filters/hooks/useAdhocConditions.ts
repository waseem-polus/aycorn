import { useMemo } from "react";
import { useLocalStorage } from "@/features/calendar/hooks";
import { treeKey } from "@/features/saved-filters/filter-definition";
import { isTree } from "@/features/saved-filters/hooks/useBoardSavedFilters";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import {
  countCompleteLeaves,
  createRoot,
} from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  ConditionGroup,
  WireGroup,
} from "@/features/task-filters/conditions/condition-types";
import { upgradeGroup } from "@/features/task-filters/conditions/condition-upgrade";
import { toWire } from "@/features/task-filters/conditions/condition-wire";
import { useToday } from "@/features/task-filters/hooks/useToday";

/**
 * A board view's unsaved condition tree: the Filter popover's ad hoc filter.
 * Nothing is named or persisted server-side — it lives under
 * `aycorn.<scope>.conditions`, so each view remembers its own until it's
 * cleared or saved as a saved filter (pinned to the board).
 */
export function useAdhocConditions(scope: string) {
  const [stored, setStored] = useLocalStorage<ConditionGroup>(
    `aycorn.${scope}.conditions`,
    createRoot(),
  );
  const tree = isTree(stored) ? upgradeGroup(stored) : createRoot();

  const today = useToday();
  const { weekStartsOn } = useAppSettingsQuery().settings;
  const key = treeKey(tree);
  // Relative dates resolve here, so a new day (or week start) re-sends them.
  const wire = useMemo(
    () => toWire(tree, { today, weekStartsOn }),
    // tree is rebuilt every render; its content key is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, today, weekStartsOn],
  );

  return {
    tree,
    /** The tree as a request param, or null while nothing is complete. */
    wire: wire as WireGroup | null,
    /** Conditions that are filled in enough to apply. */
    count: countCompleteLeaves(tree),
    update: (fn: (root: ConditionGroup) => ConditionGroup) =>
      setStored((prev) => fn(isTree(prev) ? upgradeGroup(prev) : createRoot())),
    clear: () => setStored(createRoot()),
  };
}

export type AdhocConditionsAPI = ReturnType<typeof useAdhocConditions>;
