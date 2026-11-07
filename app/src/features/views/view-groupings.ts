import type { Board } from "@/features/saved-filters/saved-filter-types";
import type {
  Granularity,
  GroupByKey,
  ViewType,
} from "@/features/views/view-types";

export const VIEW_TYPES: { type: ViewType; label: string; icon: string }[] = [
  { type: "list", label: "List", icon: "rows-3" },
  { type: "board", label: "Board", icon: "layout-dashboard" },
  { type: "month", label: "Month", icon: "calendar-days" },
  { type: "week", label: "Week", icon: "calendar" },
];

export const GROUP_LABELS: Record<GroupByKey, string> = {
  timePlanned: "Time planned",
  timeCompleted: "Time completed",
  timeCreated: "Time created",
  timeModified: "Time modified",
  project: "Project",
  stage: "Status",
  stageType: "Status category",
  priority: "Priority",
  type: "Type",
  assignee: "Assignee",
  checklist: "Checklist",
};

export const DATE_GROUP_KEYS: GroupByKey[] = [
  "timePlanned",
  "timeCompleted",
  "timeCreated",
  "timeModified",
];

export const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

type Groupings = {
  /** The groupings this view type can use on this board, in menu order. */
  options: GroupByKey[];
  /** Whether "no grouping" is an option. */
  optional: boolean;
};

/**
 * Which groupings each view type offers on a board — the one place the
 * settings UI reads. It lists only what the renderers can draw today; the
 * server's `viewTypes` is the wider set it accepts.
 */
export const viewGroupings = (type: ViewType, board: Board): Groupings => {
  switch (type) {
    case "list":
      return board.surface === "upcoming"
        ? {
            options: [
              "timePlanned",
              "timeCompleted",
              "project",
              "stage",
              "priority",
              "type",
              "assignee",
              "checklist",
            ],
            optional: false,
          }
        : { options: [], optional: true };
    case "board":
      return { options: ["stage"], optional: false };
    case "month":
    case "week":
      return { options: ["timePlanned"], optional: false };
  }
};

/**
 * The layouts a board can show today. /upcoming gains Board and Week as their
 * cross-project renderers land.
 */
export const viewTypesFor = (board: Board) =>
  board.surface === "upcoming"
    ? VIEW_TYPES.filter((t) => t.type === "list" || t.type === "month")
    : VIEW_TYPES;

export const viewTypeLabel = (type: ViewType) =>
  VIEW_TYPES.find((t) => t.type === type)?.label ?? type;
