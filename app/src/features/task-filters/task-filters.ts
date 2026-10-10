/**
 * How a date dimension is filtered. "all" ignores the dimension entirely,
 * "none" keeps only tasks missing that date, and "with" keeps only tasks that
 * have it — narrowed further by a range when one is picked.
 */
export type DateFilterMode = "all" | "none" | "with";

/** The task filter state shared by every filterable task surface. */
export type TaskFilterState = {
  search: string;
  project: number[];
  stage: number[];
  type: number[];
  priority: string[];
  assignee: string[];
  checklist: number[];
  dates: {
    plannedMode?: DateFilterMode;
    completedMode?: DateFilterMode;
    plannedFrom?: string;
    plannedTo?: string;
    plannedFromHasTime?: boolean;
    plannedToHasTime?: boolean;
    completedFrom?: string;
    completedTo?: string;
    completedFromHasTime?: boolean;
    completedToHasTime?: boolean;
  };
};

export type DateModeKey = "plannedMode" | "completedMode";

export const FILTER_DIMS = [
  "project",
  "stage",
  "type",
  "priority",
  "assignee",
  "checklist",
] as const;

export type FilterDim = (typeof FILTER_DIMS)[number];

export const EMPTY_FILTERS: TaskFilterState = {
  search: "",
  project: [],
  stage: [],
  type: [],
  priority: [],
  assignee: [],
  checklist: [],
  dates: {},
};
