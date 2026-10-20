import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/features/calendar/hooks";
import * as ops from "@/features/task-filters/conditions/condition-tree-ops";
import { toWire } from "@/features/task-filters/conditions/condition-wire";
import type {
  ConditionGroup,
  ConditionValue,
  MatchMode,
  OperatorKey,
  PropertyKey,
  StoredConditions,
} from "@/features/task-filters/conditions/condition-types";

/** Long enough to notice and reach for Undo; sonner's 4s default is gone before you can. */
export const UNDO_TOAST_MS = 8000;

const rootOf = (stored: StoredConditions | null): ConditionGroup =>
  // Anything that isn't the current envelope (an older shape, a hand-edited
  // value) starts fresh rather than feeding the builder a tree it can't read.
  stored?.version === 1 && stored.root?.kind === "group" ? stored.root : ops.createRoot();

/**
 * The condition tree for one filter surface, persisted to localStorage under
 * `aycorn.<scope>.conditions` (the same scope as the basic filters).
 *
 * Every edit is a pure tree operation applied inside one functional update,
 * so several edits in the same render compose instead of overwriting each
 * other.
 */
export function useConditionTree(scope: string) {
  const [stored, setStored] = useLocalStorage<StoredConditions | null>(
    `aycorn.${scope}.conditions`,
    null,
  );
  const root = rootOf(stored);

  /**
   * The condition whose property picker should open as soon as it renders —
   * set when a condition is added, so building a filter flows from the
   * keyboard without hunting for the new row.
   */
  const [autoOpenId, setAutoOpenId] = useState<string | null>(null);

  const update = (fn: (root: ConditionGroup) => ConditionGroup) => {
    setStored((prev) => ({ version: 1, root: fn(rootOf(prev)) }));
  };

  const replaceRoot = (next: ConditionGroup) => update(() => next);

  const offerUndo = (message: string, snapshot: ConditionGroup) => {
    toast(message, {
      duration: UNDO_TOAST_MS,
      action: { label: "Undo", onClick: () => replaceRoot(snapshot) },
    });
  };

  const addCondition = (groupId: string, property: PropertyKey | null = null) => {
    const condition = ops.createCondition(property);
    update((r) => ops.addChild(r, groupId, condition));
    setAutoOpenId(condition.id);
  };

  /** A new group starts with one empty condition, ready for its property. */
  const addGroup = (groupId: string) => {
    const condition = ops.createCondition();
    update((r) => ops.addChild(r, groupId, ops.createGroup([condition])));
    setAutoOpenId(condition.id);
  };

  /** Deleting a group with content can be undone; a single condition is cheap to redo. */
  const remove = (id: string) => {
    const found = ops.findNode(root, id);
    update((r) => ops.removeNode(r, id));
    if (found?.node.kind === "group" && found.node.children.length > 0) {
      offerUndo("Group deleted", root);
    }
  };

  const clearAll = () => {
    if (root.children.length === 0) return;
    const snapshot = root;
    update(() => ops.createRoot());
    offerUndo("Conditions cleared", snapshot);
  };

  const completeCount = ops.countCompleteLeaves(root);
  const wire = useMemo(() => toWire(root), [root]);

  return {
    root,
    wire,
    completeCount,
    autoOpenId,
    clearAutoOpen: () => setAutoOpenId(null),
    replaceRoot,
    addCondition,
    addGroup,
    remove,
    clearAll,
    duplicate: (id: string) => update((r) => ops.duplicateNode(r, id).root),
    wrapInGroup: (id: string) => update((r) => ops.wrapInGroup(r, id)),
    move: (id: string, toGroupId: string, index: number) =>
      update((r) => ops.moveNode(r, id, toGroupId, index)),
    shift: (id: string, delta: -1 | 1) => update((r) => ops.shiftNode(r, id, delta)),
    setMatch: (groupId: string, match: MatchMode) =>
      update((r) => ops.setMatch(r, groupId, match)),
    setProperty: (id: string, property: PropertyKey) =>
      update((r) => ops.setProperty(r, id, property)),
    setOperator: (id: string, operator: OperatorKey) =>
      update((r) => ops.setOperator(r, id, operator)),
    setValue: (id: string, value: ConditionValue) =>
      update((r) => ops.setValue(r, id, value)),
  };
}

export type ConditionTreeAPI = ReturnType<typeof useConditionTree>;
