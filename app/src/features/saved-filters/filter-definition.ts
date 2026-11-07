import { basicToConditions } from "@/features/task-filters/conditions/basic-to-conditions";
import {
  countCompleteLeaves,
  createRoot,
} from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionGroup,
  ConditionNode,
} from "@/features/task-filters/conditions/condition-types";
import { upgradeGroup } from "@/features/task-filters/conditions/condition-upgrade";
import type { PersistedFilterState } from "@/features/task-filters/task-filters";

type StoredCondition = Omit<Condition, "id">;
type StoredGroup = Omit<ConditionGroup, "id" | "children"> & { children: StoredNode[] };
type StoredNode = StoredCondition | StoredGroup;

/**
 * The saved form of a filter, as stored in `saved_filter.definition` (and a
 * view's source). Node ids are dropped so two definitions compare by content.
 * Dates stay local days (not instants) so a filter means the same day
 * wherever it's loaded.
 *
 * Changing the shape: bump `version`, add an upgrade step to
 * `fromDefinition`, and accept the version on the server.
 * v2: date values became `DateRef`s, so relative dates can be saved.
 * v3: conditions only — the basic filters are folded into the tree.
 */
export type FilterDefinition =
  | { version: 3; conditions: StoredGroup }
  | { version: 1 | 2; basic?: Partial<PersistedFilterState>; conditions?: StoredGroup };

const stripIds = (node: ConditionNode): StoredNode =>
  node.kind === "condition"
    ? { kind: "condition", property: node.property, operator: node.operator, value: node.value }
    : { kind: "group", match: node.match, children: node.children.map(stripIds) };

const addIds = (node: StoredNode): ConditionNode =>
  node.kind === "condition"
    ? { ...node, id: crypto.randomUUID() }
    : { ...node, id: crypto.randomUUID(), children: node.children.map(addIds) };

export const toDefinition = (root: ConditionGroup): FilterDefinition => ({
  version: 3,
  conditions: stripIds(root) as StoredGroup,
});

/**
 * Editing tree for a stored definition of any version, with fresh node ids
 * (the root keeps its fixed id). Pre-v3 basic filters become leading rows —
 * both halves were ANDed, so this only works while the root matches "all";
 * an "any" root is wrapped in a group of its own first.
 */
export const fromDefinition = (definition: FilterDefinition): ConditionGroup => {
  const conditions = definition.conditions ?? { kind: "group", match: "all", children: [] };
  const tree = upgradeGroup({
    kind: "group",
    id: "root",
    match: conditions.match,
    children: conditions.children.map(addIds),
  });
  if (definition.version === 3 || !definition.basic) return tree;

  const basicRows = basicToConditions(definition.basic);
  if (basicRows.length === 0) return tree;
  if (tree.match === "all") return { ...tree, children: [...basicRows, ...tree.children] };
  const wrapped: ConditionGroup = { ...tree, id: crypto.randomUUID() };
  return { ...createRoot(), children: [...basicRows, wrapped] };
};

/** JSON with sorted keys, so equal definitions compare equal whatever their key order. */
const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );

/** Canonical form of a tree, so an upgraded old definition equals its own upgrade. */
export const treeKey = (root: ConditionGroup): string => stableStringify(toDefinition(root));

export const definitionsEqual = (a: FilterDefinition, b: FilterDefinition) =>
  treeKey(fromDefinition(a)) === treeKey(fromDefinition(b));

/** How many rules a definition applies: its complete conditions. */
export const definitionRuleCount = (definition: FilterDefinition): number =>
  countCompleteLeaves(fromDefinition(definition));
