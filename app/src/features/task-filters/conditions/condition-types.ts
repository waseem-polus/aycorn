/**
 * The condition tree: nested AND/OR groups of property/operator/value
 * conditions. This is the in-browser editing shape (ids on every node, values
 * kept in the picker's own units); `toWire` turns it into the server's JSON.
 */

export type MatchMode = "all" | "any";

/** Properties defined once in the registry. */
export type StaticPropertyKey =
  | "project"
  | "projectName"
  | "checklist"
  | "checklistName"
  | "stage"
  | "stageType"
  | "type"
  | "assignee"
  | "priority"
  | "title"
  | "timePlanned"
  | "timeCompleted"
  | "taskLinks";

/** "from" = this task is the relationship's source (Blocks); "to" = its target (Blocked By). */
export type LinkDirection = "from" | "to";

/**
 * One direction of one relationship type, e.g. `link:1:to` = "Blocked By".
 * Relationship types are user-defined, so these properties are generated from
 * the types that exist rather than listed in the registry.
 */
export type LinkPropertyKey = `link:${number}:${LinkDirection}`;

export type PropertyKey = StaticPropertyKey | LinkPropertyKey;

export type OperatorKey =
  | "is"
  | "is_not"
  | "is_empty"
  | "is_not_empty"
  | "before"
  | "after"
  | "on"
  | "between"
  | "is_set"
  | "is_not_set"
  | "contains"
  | "does_not_contain"
  | "equals"
  | "not_equals"
  | "is_archived"
  | "is_not_archived";

export type ConditionValue =
  /** For link properties: task ids, or the lone "any" / "none" sentinel. */
  | { kind: "ids"; ids: (string | number)[] }
  /** A local calendar day, `yyyy-MM-dd`. */
  | { kind: "date"; date: string }
  | { kind: "range"; from: string; to: string }
  | { kind: "text"; text: string }
  | null;

export type Condition = {
  kind: "condition";
  id: string;
  property: PropertyKey | null;
  operator: OperatorKey | null;
  value: ConditionValue;
};

export type ConditionGroup = {
  kind: "group";
  id: string;
  match: MatchMode;
  children: ConditionNode[];
};

export type ConditionNode = Condition | ConditionGroup;

/** The localStorage envelope. Bump `version` when the shape changes. */
export type StoredConditions = { version: 1; root: ConditionGroup };

/** Server wire format — also the payload a saved filter will store. */
export type WireCondition = {
  property: StaticPropertyKey | "taskLink";
  operator: OperatorKey;
  values?: (string | number)[];
  at?: string;
  from?: string;
  to?: string;
  text?: string;
  linkType?: number;
  direction?: LinkDirection;
};

export type WireGroup = { match: MatchMode; children: (WireGroup | WireCondition)[] };
