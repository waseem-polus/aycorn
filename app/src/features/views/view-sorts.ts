import type { Board } from "@/features/saved-filters/saved-filter-types";
import type { SortKey, SortRule, ViewType } from "@/features/views/view-types";

export const SORT_LABELS: Record<SortKey, string> = {
  name: "Name",
  priority: "Priority",
  stage: "Status",
  stageType: "Status category",
  type: "Type",
  assignee: "Assignee",
  checklist: "Checklist",
  project: "Project",
  timePlanned: "Time planned",
  timeCompleted: "Time completed",
  timeCreated: "Time created",
  timeModified: "Time modified",
};

const SORT_KEYS: SortKey[] = [
  "name",
  "priority",
  "stage",
  "stageType",
  "type",
  "assignee",
  "checklist",
  "timePlanned",
  "timeCompleted",
  "timeCreated",
  "timeModified",
];

/** Most rules a view keeps — matches the server's `maxSortRules`. */
export const MAX_SORT_RULES = 5;

/** The properties a board's views can sort by, in menu order. Project only applies across projects. */
export const viewSortOptions = (board: Board): SortKey[] =>
  board.surface === "upcoming" ? ["project", ...SORT_KEYS] : SORT_KEYS;

/** Calendars place tasks by time, so only lists and boards honour a sort. */
export const sortApplies = (type: ViewType) => type === "list" || type === "board";

/** "Priority ↓" for one rule, "3 sorts" for several, undefined for none. */
export const sortSummary = (rules: SortRule[]): string | undefined => {
  if (rules.length === 0) return undefined;
  if (rules.length > 1) return `${rules.length} sorts`;
  const [rule] = rules;
  return `${SORT_LABELS[rule.property]} ${rule.direction === "asc" ? "↑" : "↓"}`;
};
