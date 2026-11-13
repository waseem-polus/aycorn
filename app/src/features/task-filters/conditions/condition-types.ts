/**
 * The condition tree: nested AND/OR groups of property/operator/value
 * conditions. This is the in-browser editing shape (ids on every node, values
 * kept in the picker's own units); `toWire` turns it into the server's JSON.
 */

/** all = AND, any = OR, none = NOR (matches only when no child does). */
export type MatchMode = "all" | "any" | "none";

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

export type RelativeUnit = "day" | "week" | "month" | "year";

/**
 * A date that moves with today. Amounts are signed: negative is the past.
 * - `offset`: a shifted day, e.g. -3 days = "3 days ago", 0 days = "Today". In
 *   weeks, months or years it covers that whole calendar period: +2 weeks =
 *   the week two weeks from now.
 * - `window`: a run of days from today, today included, e.g. +7 days = "Next 7 days".
 * - `period`: a whole calendar week, month or year, e.g. 0 weeks = "This week".
 *   The picker only builds offset 0; other offsets still resolve and label.
 */
export type RelativeAnchor =
  | { type: "offset"; amount: number; unit: RelativeUnit }
  | { type: "window"; amount: number; unit: RelativeUnit }
  | { type: "period"; offset: number; unit: Exclude<RelativeUnit, "day"> };

/**
 * A day or span of days, fixed or relative. Saved as-is — relative refs are
 * resolved against today only when a filter is sent (see `resolveDateRef`).
 */
export type DateRef =
  /** A local calendar day, `yyyy-MM-dd`. */
  | { kind: "absolute"; date: string }
  | { kind: "relative"; anchor: RelativeAnchor };

export type ConditionValue =
  /** For link properties: task ids, or the lone "any" / "none" sentinel. */
  | { kind: "ids"; ids: (string | number)[] }
  | { kind: "date"; ref: DateRef }
  /** Either end may be unset while the range is being picked. */
  | { kind: "range"; from: DateRef | null; to: DateRef | null }
  | { kind: "text"; text: string }
  | null;

/**
 * How a date condition treats a task's planned window: `any` = any part of
 * it meets the condition (overlap); `entire` = all of it must. Absent means
 * `any`, so conditions saved before this existed keep their behaviour.
 */
export type DateSpan = "any" | "entire";

export type Condition = {
  kind: "condition";
  id: string;
  property: PropertyKey | null;
  operator: OperatorKey | null;
  value: ConditionValue;
  span?: DateSpan;
};

export type ConditionGroup = {
  kind: "group";
  id: string;
  match: MatchMode;
  children: ConditionNode[];
};

export type ConditionNode = Condition | ConditionGroup;

/**
 * The localStorage envelope. Bump `version` when the shape changes, and teach
 * `upgradeGroup` (condition-upgrade.ts) to read the old one.
 * v2: date values became `DateRef`s.
 */
export type StoredConditions = { version: 1 | 2; root: ConditionGroup };

/** Server wire format — also the payload a saved filter will store. */
export type WireCondition = {
  property: StaticPropertyKey | "taskLink";
  operator: OperatorKey;
  values?: (string | number)[];
  at?: string;
  from?: string;
  to?: string;
  text?: string;
  span?: DateSpan;
  linkType?: number;
  direction?: LinkDirection;
};

export type WireGroup = { match: MatchMode; children: (WireGroup | WireCondition)[] };
