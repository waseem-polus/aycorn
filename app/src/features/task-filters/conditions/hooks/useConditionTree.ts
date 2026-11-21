import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as ops from "@/features/task-filters/conditions/condition-tree-ops";
import { toWire } from "@/features/task-filters/conditions/condition-wire";
import { useToday } from "@/features/task-filters/hooks/useToday";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import type {
  ConditionGroup,
  ConditionValue,
  DateSpan,
  MatchMode,
  OperatorKey,
  PropertyKey,
} from "@/features/task-filters/conditions/condition-types";

/** A just-added condition and the picker it opens with. */
type AutoOpen = { id: string; picker: "property" | "operator" };

/** Long enough to notice and reach for Undo; sonner's 4s default is gone before you can. */
export const UNDO_TOAST_MS = 8000;

/**
 * Editing operations for a condition tree. The tree itself lives wherever the
 * owner keeps it (a saved filter draft, a view source); `update` applies a
 * pure tree operation to it as one functional update, so several edits in the
 * same render compose instead of overwriting each other.
 */
export function useConditionTree(
  root: ConditionGroup,
  update: (fn: (root: ConditionGroup) => ConditionGroup) => void,
) {
  /**
   * The condition whose picker should open as soon as it renders — set when
   * a condition is added, so building a filter flows from the keyboard
   * without hunting for the new row. A condition added with its property
   * already chosen opens its operator instead.
   */
  const [autoOpen, setAutoOpen] = useState<AutoOpen | null>(null);

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
    setAutoOpen({ id: condition.id, picker: property ? "operator" : "property" });
  };

  /** A new group starts with one empty condition, ready for its property. */
  const addGroup = (groupId: string) => {
    const condition = ops.createCondition();
    update((r) => ops.addChild(r, groupId, ops.createGroup([condition])));
    setAutoOpen({ id: condition.id, picker: "property" });
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

  const today = useToday();
  const { weekStartsOn } = useAppSettingsQuery().settings;
  const completeCount = ops.countCompleteLeaves(root);
  // Relative dates resolve here, so a new day (or week start) re-sends them.
  const wire = useMemo(
    () => toWire(root, { today, weekStartsOn }),
    [root, today, weekStartsOn],
  );

  return {
    root,
    wire,
    completeCount,
    autoOpen,
    clearAutoOpen: () => setAutoOpen(null),
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
    setSpan: (id: string, span: DateSpan) => update((r) => ops.setSpan(r, id, span)),
    setValue: (id: string, value: ConditionValue) =>
      update((r) => ops.setValue(r, id, value)),
  };
}

export type ConditionTreeAPI = ReturnType<typeof useConditionTree>;
