import type { FilterDefinition } from "@/features/saved-filters/filter-definition";
import type { Board } from "@/features/saved-filters/saved-filter-types";

/** A view's layout. New layouts join here, in `VIEW_TYPES`, and in the server's `viewTypes`. */
export type ViewType = "list" | "board" | "month" | "week";

/** What a view groups its tasks by. Dates group into day/week/month buckets on lists. */
export type GroupByKey =
  | "timePlanned"
  | "timeCompleted"
  | "timeCreated"
  | "timeModified"
  | "project"
  | "stage"
  | "stageType"
  | "priority"
  | "type"
  | "assignee"
  | "checklist";

export type Granularity = "day" | "week" | "month";

export type GroupOptions = { granularity?: Granularity };

/**
 * A user-defined way of looking at a board's tasks: a layout, a grouping, and
 * `Source` — the view's own filter, in the saved-filter definition shape.
 */
export type BoardView = {
  ID: number;
  Surface: Board["surface"];
  ProjectID: number | null;
  Name: string;
  Icon: string;
  Color: string;
  Type: ViewType;
  GroupBy: GroupByKey | null;
  GroupOptions: GroupOptions;
  Source: FilterDefinition;
  Position: number;
  TimeCreated: string;
  TimeModified: string;
};

/** A PATCH body: only the fields present change. `GroupBy: null` clears the grouping. */
export type ViewPatch = Partial<{
  name: string;
  icon: string;
  color: string;
  type: ViewType;
  groupBy: GroupByKey | null;
  groupOptions: GroupOptions;
  source: FilterDefinition;
}>;
