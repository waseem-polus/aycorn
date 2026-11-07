import { startOfDay } from "date-fns";
import { STAGE_TYPE_LABELS } from "@/features/task-filters/option-groups";
import type { Granularity, GroupByKey } from "@/features/views/view-types";
import { STAGE_TYPE_COLORS } from "@/features/workflows/shared/stage-type-rules";
import type { Priority, StageType, Task } from "@/types/types";
import {
  formatMonthDay,
  formatMonthShort,
  formatMonthYear,
  formatWeekdayMonthDay,
} from "@/utils/date";

/**
 * Any task a view can group: a project's tasks (`ChecklistTask`) or
 * /upcoming's cross-project ones (`TaskWithProject`).
 */
export type GroupableTask = Task & { ProjectID?: number; ChecklistName?: string };

type Visual = { Name: string; Icon: string; Color: string };

/** Lookups the category buckets label themselves from. */
export type GroupingData = {
  projectById: Record<number, Visual>;
  stageById: Record<number, Visual & { Type?: StageType }>;
};

export type TaskGroup<T extends GroupableTask = GroupableTask> = {
  key: string;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string; // stage color for tint/stroke
  tone?: "danger" | "muted" | "default";
  priority?: Priority;
  order: number;
  tasks: T[];
};

type Bucket = Omit<TaskGroup, "tasks">;

export const PRIORITY_ORDER = ["Urgent", "High", "Medium", "Low"] as const;
const priRank = (p: string) => {
  const i = PRIORITY_ORDER.indexOf(p as (typeof PRIORITY_ORDER)[number]);
  return i < 0 ? 99 : i;
};

const startOfWeek = (date: Date) => {
  const x = startOfDay(date);
  const dow = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - dow);
  return x;
};
const addDays = (date: Date, n: number) => {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
};

const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
const weekDiff = (a: Date, b: Date) =>
  Math.round((startOfWeek(a).getTime() - startOfWeek(b).getTime()) / (7 * 86400000));

const fmtWeekRange = (ws: Date) => {
  const we = addDays(ws, 6);
  if (ws.getMonth() === we.getMonth())
    return `${formatMonthShort(ws)} ${ws.getDate()} – ${we.getDate()}`;
  return `${formatMonthShort(ws)} ${ws.getDate()} – ${formatMonthShort(we)} ${we.getDate()}`;
};

type DateKey = "timePlanned" | "timeCompleted" | "timeCreated" | "timeModified";

const DATE_FIELD: Record<DateKey, (t: Task) => string | null> = {
  timePlanned: (t) => t.TimePlannedStart,
  timeCompleted: (t) => t.TimeCompleted,
  timeCreated: (t) => t.TimeCreated,
  timeModified: (t) => t.TimeModified,
};

const isDateKey = (key: GroupByKey): key is DateKey => key in DATE_FIELD;

function timeBucket(task: Task, field: DateKey, gran: Granularity, today: Date): Bucket {
  const raw = DATE_FIELD[field](task);
  if (!raw) {
    return {
      key: "__none",
      label: field === "timeCompleted" ? "Not completed" : "No date",
      icon: "circle-dashed",
      tone: "muted",
      order: Number.MAX_SAFE_INTEGER,
    };
  }
  const d = new Date(raw);

  // Only planned dates can be late: an unfinished task planned before the
  // current day/week/month collects under Overdue.
  if (field === "timePlanned" && !task.TimeCompleted) {
    const overdue =
      (gran === "day" && dayDiff(d, today) < 0) ||
      (gran === "week" && weekDiff(d, today) < 0) ||
      (gran === "month" &&
        d.getFullYear() * 12 + d.getMonth() < today.getFullYear() * 12 + today.getMonth());
    if (overdue)
      return { key: "__overdue", label: "Overdue", icon: "circle-alert", tone: "danger", order: -1e9 };
  }

  if (gran === "day") {
    const diff = dayDiff(d, today);
    const ds = startOfDay(d);
    const relative =
      diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : null;
    return {
      key: "d" + ds.getTime(),
      label: relative ?? formatWeekdayMonthDay(ds),
      sublabel: relative ? formatMonthDay(ds) : undefined,
      icon: "calendar",
      order: diff,
    };
  }
  if (gran === "month") {
    const mDiff =
      d.getFullYear() * 12 + d.getMonth() - (today.getFullYear() * 12 + today.getMonth());
    const relative =
      mDiff === 0 ? "This month" : mDiff === 1 ? "Next month" : mDiff === -1 ? "Last month" : null;
    return {
      key: "m" + d.getFullYear() + "-" + d.getMonth(),
      label: relative ?? formatMonthYear(d),
      sublabel: relative ? formatMonthYear(d) : undefined,
      icon: "calendar-days",
      order: mDiff,
    };
  }
  const ws = startOfWeek(d);
  const diff = weekDiff(d, today);
  const relative =
    diff === 0 ? "This week" : diff === 1 ? "Next week" : diff === -1 ? "Last week" : null;
  return {
    key: "w" + ws.getTime(),
    label: relative ?? fmtWeekRange(ws),
    sublabel: relative ? fmtWeekRange(ws) : undefined,
    icon: "calendar",
    order: diff,
  };
}

const STAGE_TYPE_ORDER: Record<StageType, number> = { open: 0, todo: 1, doing: 2, done: 3 };

function categoryBucket(task: GroupableTask, dim: GroupByKey, data: GroupingData): Bucket {
  switch (dim) {
    case "project": {
      const id = task.ProjectID ?? 0;
      const project = data.projectById[id];
      return {
        key: "p" + id,
        label: project?.Name ?? `Project ${id}`,
        icon: project?.Icon || "folder",
        color: project?.Color,
        order: id,
      };
    }
    case "stage": {
      const s = data.stageById[task.Stage];
      return {
        key: "s" + task.Stage,
        label: s?.Name ?? `Stage ${task.Stage}`,
        icon: s?.Icon ?? "land-plot",
        color: s?.Color,
        order: task.Stage,
      };
    }
    case "stageType": {
      const type = data.stageById[task.Stage]?.Type;
      if (!type) return { key: "st-unknown", label: "Unknown", tone: "muted", order: 99 };
      return {
        key: "st-" + type,
        label: STAGE_TYPE_LABELS[type],
        icon: "circle",
        color: STAGE_TYPE_COLORS[type],
        order: STAGE_TYPE_ORDER[type],
      };
    }
    case "priority":
      return {
        key: "pri-" + task.Priority,
        label: task.Priority,
        priority: task.Priority,
        order: priRank(task.Priority),
      };
    case "type":
      return {
        key: "ty-" + task.Type.ID,
        label: task.Type.Name || "Unknown type",
        icon: task.Type.Icon,
        color: task.Type.Color,
        order: task.Type.ID,
      };
    case "assignee":
      return task.Assignee
        ? { key: "a-" + task.Assignee, label: task.Assignee, icon: "user", order: task.Assignee.charCodeAt(0) }
        : { key: "a-none", label: "Not assigned", icon: "user", tone: "muted", order: 1e6 };
    case "checklist": {
      const projectId = task.ProjectID ?? 0;
      return {
        key: "cl-" + projectId + "-" + task.Checklist,
        label: task.ChecklistName ?? `Checklist ${task.Checklist}`,
        sublabel: task.ProjectID !== undefined ? data.projectById[projectId]?.Name : undefined,
        icon: "land-plot",
        order: projectId * 1000 + task.Checklist,
      };
    }
    default:
      return { key: "other", label: "Other", order: 0 };
  }
}

/** Planned date first (unplanned last), then priority. */
export const sortTasks = <T extends Task>(tasks: T[]): T[] =>
  [...tasks].sort((a, b) => {
    const ad = a.TimePlannedStart ? new Date(a.TimePlannedStart).getTime() : Infinity;
    const bd = b.TimePlannedStart ? new Date(b.TimePlannedStart).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    return priRank(a.Priority) - priRank(b.Priority);
  });

/**
 * Buckets tasks by a view's grouping, in display order. Dates bucket by
 * `granularity` relative to `today`; everything else by the property's value.
 * Within a group, tasks sort by planned date, then priority.
 */
export function buildGroups<T extends GroupableTask>(
  tasks: T[],
  opts: { groupBy: GroupByKey; granularity: Granularity; today: Date; data: GroupingData },
): TaskGroup<T>[] {
  const { groupBy, granularity, today, data } = opts;
  const map = new Map<string, TaskGroup<T>>();
  for (const t of tasks) {
    const b = isDateKey(groupBy)
      ? timeBucket(t, groupBy, granularity, today)
      : categoryBucket(t, groupBy, data);
    if (!map.has(b.key)) map.set(b.key, { ...b, tasks: [] });
    map.get(b.key)!.tasks.push(t);
  }

  const groups = [...map.values()].sort((a, b) => a.order - b.order);
  for (const g of groups) g.tasks = sortTasks(g.tasks);
  return groups;
}
