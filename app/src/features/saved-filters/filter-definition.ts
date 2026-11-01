import {
  countCompleteLeaves,
  createRoot,
} from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionGroup,
  ConditionNode,
} from "@/features/task-filters/conditions/condition-types";
import {
  EMPTY_PERSISTED_FILTERS,
  type PersistedFilterState,
} from "@/features/task-filters/task-filters";

/**
 * What a filter is, in editing terms: the basic filters plus the condition
 * tree. This is a board's live filter state; drafts are stored in this shape,
 * ids included, so edits keep stable React keys.
 */
export type FilterState = {
  basic: PersistedFilterState;
  root: ConditionGroup;
};

type StoredCondition = Omit<Condition, "id">;
type StoredGroup = Omit<ConditionGroup, "id" | "children"> & { children: StoredNode[] };
type StoredNode = StoredCondition | StoredGroup;

/**
 * The saved form of a filter, as stored in `saved_filter.definition`. Node ids
 * are dropped so two definitions compare by content. Dates stay local days
 * (not instants) so a filter means the same day wherever it's loaded.
 *
 * Changing the shape: bump `version`, add an upgrade step to
 * `fromDefinition`, and accept the version on the server.
 */
export type FilterDefinition = {
  version: 1;
  basic: PersistedFilterState;
  conditions: StoredGroup;
};

export const EMPTY_FILTER_STATE: FilterState = {
  basic: EMPTY_PERSISTED_FILTERS,
  root: createRoot(),
};

const stripIds = (node: ConditionNode): StoredNode =>
  node.kind === "condition"
    ? { kind: "condition", property: node.property, operator: node.operator, value: node.value }
    : { kind: "group", match: node.match, children: node.children.map(stripIds) };

const addIds = (node: StoredNode): ConditionNode =>
  node.kind === "condition"
    ? { ...node, id: crypto.randomUUID() }
    : { ...node, id: crypto.randomUUID(), children: node.children.map(addIds) };

export const toDefinition = (state: FilterState): FilterDefinition => ({
  version: 1,
  basic: state.basic,
  conditions: stripIds(state.root) as StoredGroup,
});

/** Editing state for a stored definition, with fresh node ids (the root keeps its fixed id). */
export const fromDefinition = (definition: FilterDefinition): FilterState => {
  const conditions = definition.conditions ?? { kind: "group", match: "all", children: [] };
  return {
    basic: { ...EMPTY_PERSISTED_FILTERS, ...definition.basic },
    root: {
      kind: "group",
      id: "root",
      match: conditions.match,
      children: conditions.children.map(addIds),
    },
  };
};

/** JSON with sorted keys, so equal definitions compare equal whatever their key order. */
const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );

export const definitionsEqual = (a: FilterDefinition, b: FilterDefinition) =>
  stableStringify({ ...a, basic: { ...EMPTY_PERSISTED_FILTERS, ...a.basic } }) ===
  stableStringify({ ...b, basic: { ...EMPTY_PERSISTED_FILTERS, ...b.basic } });

/** How many rules a definition applies: selected basic values, date modes, and complete conditions. */
export const definitionRuleCount = (definition: FilterDefinition): number => {
  const { basic, root } = fromDefinition(definition);
  const values = (["project", "stage", "type", "priority", "assignee", "checklist"] as const).reduce(
    (n, dim) => n + (basic[dim]?.length ?? 0),
    0,
  );
  const dates = (["plannedMode", "completedMode"] as const).filter(
    (k) => (basic.dates?.[k] ?? "all") !== "all",
  ).length;
  return values + dates + countCompleteLeaves(root);
};
