import { OPERATORS } from "@/features/task-filters/conditions/condition-operators";
import { operatorsFor } from "@/features/task-filters/conditions/condition-properties";
import { isDateRefComplete } from "@/features/task-filters/conditions/relative-dates";
import type {
  Condition,
  ConditionGroup,
  ConditionNode,
  ConditionValue,
  DateSpan,
  MatchMode,
  OperatorKey,
  PropertyKey,
} from "@/features/task-filters/conditions/condition-types";

/**
 * Pure, immutable operations on a condition tree. Every function takes the
 * root and returns a new root (or the same one when the edit is invalid), so
 * the storage hook can apply any of them inside one functional update.
 */

/** The root group is depth 1; the server enforces the same cap. */
export const MAX_GROUP_DEPTH = 3;

const newId = () => crypto.randomUUID();

export const createCondition = (property: PropertyKey | null = null): Condition => ({
  kind: "condition",
  id: newId(),
  property,
  operator: property ? operatorsFor(property)[0] : null,
  value: null,
});

export const createGroup = (children: ConditionNode[] = []): ConditionGroup => ({
  kind: "group",
  id: newId(),
  match: "all",
  children,
});

export const createRoot = (): ConditionGroup => ({
  kind: "group",
  id: "root",
  match: "all",
  children: [],
});

/* ------------------------------------------------------------------ *
 * Lookup
 * ------------------------------------------------------------------ */

type Located = {
  node: ConditionNode;
  parent: ConditionGroup | null;
  index: number;
  /** Depth of the group this node lives in (the root's children are in depth 1). */
  parentDepth: number;
};

export const findNode = (root: ConditionGroup, id: string): Located | null => {
  if (root.id === id) return { node: root, parent: null, index: -1, parentDepth: 0 };
  const walk = (group: ConditionGroup, depth: number): Located | null => {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      if (child.id === id) return { node: child, parent: group, index: i, parentDepth: depth };
      if (child.kind === "group") {
        const found = walk(child, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(root, 1);
};

/** Depth of a group (root = 1), or 0 when it isn't in the tree. */
export const groupDepth = (root: ConditionGroup, groupId: string): number => {
  const found = findNode(root, groupId);
  return found ? found.parentDepth + 1 : 0;
};

/** How many group levels a node adds when placed somewhere: 0 for a condition. */
const groupHeight = (node: ConditionNode): number =>
  node.kind === "condition"
    ? 0
    : 1 + Math.max(0, ...node.children.map(groupHeight));

/** Whether `node` can live inside a group at `depth` without exceeding the cap. */
export const fitsAtDepth = (node: ConditionNode, depth: number) =>
  depth + groupHeight(node) <= MAX_GROUP_DEPTH;

export const containsNode = (node: ConditionNode, id: string): boolean =>
  node.id === id || (node.kind === "group" && node.children.some((c) => containsNode(c, id)));

/* ------------------------------------------------------------------ *
 * Structural edits
 * ------------------------------------------------------------------ */

/** Rebuilds the path to `groupId`, replacing that group with `fn(group)`. */
const updateGroup = (
  root: ConditionGroup,
  groupId: string,
  fn: (group: ConditionGroup) => ConditionGroup,
): ConditionGroup => {
  if (root.id === groupId) return fn(root);
  return {
    ...root,
    children: root.children.map((c) => (c.kind === "group" ? updateGroup(c, groupId, fn) : c)),
  };
};

const updateNode = (
  root: ConditionGroup,
  id: string,
  fn: (node: ConditionNode) => ConditionNode,
): ConditionGroup => {
  const found = findNode(root, id);
  if (!found) return root;
  if (!found.parent) return fn(root) as ConditionGroup;
  return updateGroup(root, found.parent.id, (g) => ({
    ...g,
    children: g.children.map((c) => (c.id === id ? fn(c) : c)),
  }));
};

export const addChild = (root: ConditionGroup, groupId: string, node: ConditionNode) => {
  if (!fitsAtDepth(node, groupDepth(root, groupId))) return root;
  return updateGroup(root, groupId, (g) => ({ ...g, children: [...g.children, node] }));
};

export const removeNode = (root: ConditionGroup, id: string): ConditionGroup => {
  const found = findNode(root, id);
  if (!found?.parent) return root;
  return updateGroup(root, found.parent.id, (g) => ({
    ...g,
    children: g.children.filter((c) => c.id !== id),
  }));
};

const cloneWithFreshIds = (node: ConditionNode): ConditionNode =>
  node.kind === "condition"
    ? { ...node, id: newId() }
    : { ...node, id: newId(), children: node.children.map(cloneWithFreshIds) };

/** Inserts a copy right after the original. Returns the copy's id with the new root. */
export const duplicateNode = (root: ConditionGroup, id: string) => {
  const found = findNode(root, id);
  if (!found?.parent) return { root, copyId: null };
  const copy = cloneWithFreshIds(found.node);
  const next = updateGroup(root, found.parent.id, (g) => {
    const children = [...g.children];
    children.splice(found.index + 1, 0, copy);
    return { ...g, children };
  });
  return { root: next, copyId: copy.id };
};

/** Replaces the node with a new group containing it. */
export const wrapInGroup = (root: ConditionGroup, id: string): ConditionGroup => {
  const found = findNode(root, id);
  if (!found?.parent) return root;
  const wrapper = createGroup([found.node]);
  if (!fitsAtDepth(wrapper, found.parentDepth)) return root;
  return updateNode(root, id, () => wrapper);
};

/** Whether `id` could be wrapped in a new group without exceeding the depth cap. */
export const canWrap = (root: ConditionGroup, id: string) => {
  const found = findNode(root, id);
  return !!found?.parent && fitsAtDepth(createGroup([found.node]), found.parentDepth);
};

/**
 * Moves a node into `toGroupId` at `index` (an index into the target's
 * children as they are after the node is removed). Refuses moves into the
 * node's own subtree or past the depth cap.
 */
export const moveNode = (
  root: ConditionGroup,
  id: string,
  toGroupId: string,
  index: number,
): ConditionGroup => {
  const found = findNode(root, id);
  if (!found?.parent || containsNode(found.node, toGroupId)) return root;
  const without = removeNode(root, id);
  if (!fitsAtDepth(found.node, groupDepth(without, toGroupId))) return root;
  return updateGroup(without, toGroupId, (g) => {
    const children = [...g.children];
    children.splice(Math.max(0, Math.min(index, children.length)), 0, found.node);
    return { ...g, children };
  });
};

/** Moves a node one slot up (-1) or down (+1) within its group. */
export const shiftNode = (root: ConditionGroup, id: string, delta: -1 | 1) => {
  const found = findNode(root, id);
  if (!found?.parent) return root;
  const target = found.index + delta;
  if (target < 0 || target >= found.parent.children.length) return root;
  return moveNode(root, id, found.parent.id, target);
};

/* ------------------------------------------------------------------ *
 * Field edits
 * ------------------------------------------------------------------ */

export const setMatch = (root: ConditionGroup, groupId: string, match: MatchMode) =>
  updateGroup(root, groupId, (g) => ({ ...g, match }));

/** Changing the property resets the operator to its default and drops the value. */
export const setProperty = (root: ConditionGroup, id: string, property: PropertyKey) =>
  updateNode(root, id, (n) =>
    n.kind === "condition" && n.property !== property
      ? { ...n, property, operator: operatorsFor(property)[0], value: null }
      : n,
  );

/** The value survives an operator change when both need the same kind of value. */
export const setOperator = (root: ConditionGroup, id: string, operator: OperatorKey) =>
  updateNode(root, id, (n) => {
    if (n.kind !== "condition") return n;
    const keepValue = n.operator && OPERATORS[n.operator].arity === OPERATORS[operator].arity;
    return { ...n, operator, value: keepValue ? n.value : null };
  });

export const setSpan = (root: ConditionGroup, id: string, span: DateSpan) =>
  updateNode(root, id, (n) => (n.kind === "condition" ? { ...n, span } : n));

export const setValue = (root: ConditionGroup, id: string, value: ConditionValue) =>
  updateNode(root, id, (n) => (n.kind === "condition" ? { ...n, value } : n));

/* ------------------------------------------------------------------ *
 * Completeness
 * ------------------------------------------------------------------ */

/** A condition counts and is sent only once it has everything its operator needs. */
export const isComplete = (c: Condition): boolean => {
  if (!c.property || !c.operator) return false;
  const v = c.value;
  switch (OPERATORS[c.operator].arity) {
    case "none":
      return true;
    case "ids":
      return v?.kind === "ids" && v.ids.length > 0;
    case "date":
      return v?.kind === "date" && isDateRefComplete(v.ref);
    case "range":
      return v?.kind === "range" && isDateRefComplete(v.from) && isDateRefComplete(v.to);
    case "text":
      return v?.kind === "text" && v.text.trim() !== "";
  }
};

export const countCompleteLeaves = (group: ConditionGroup): number =>
  group.children.reduce(
    (n, c) => n + (c.kind === "group" ? countCompleteLeaves(c) : isComplete(c) ? 1 : 0),
    0,
  );
