import type { TaskWithProject } from "@/types/types";
import type {
  GroupByKey,
  Granularity,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import { startOfDay } from "date-fns";
import {
  formatMonthDay,
  formatMonthShort,
  formatMonthYear,
  formatWeekdayMonthDay,
} from "@/utils/date";

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

export const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
const weekDiff = (a: Date, b: Date) =>
  Math.round(
    (startOfWeek(a).getTime() - startOfWeek(b).getTime()) / (7 * 86400000),
  );

const fmtDay = (d: Date) => formatMonthDay(d);
const fmtDayFull = (d: Date) => formatWeekdayMonthDay(d);
const fmtMonth = (d: Date) => formatMonthYear(d);

export const fmtWeekRange = (ws: Date) => {
  const we = addDays(ws, 6);
  if (ws.getMonth() === we.getMonth())
    return `${formatMonthShort(ws)} ${ws.getDate()} – ${we.getDate()}`;
  return `${formatMonthShort(ws)} ${ws.getDate()} – ${formatMonthShort(we)} ${we.getDate()}`;
};

export function fmtTaskDate(task: TaskWithProject, today: Date): string | null {
  if (!task.TimePlannedStart) return null;
  const d = new Date(task.TimePlannedStart);
  const diff = dayDiff(d, today);
  let label: string;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else label = fmtDay(d);
  if (task.TimePlannedEnd && task.TimePlannedEnd !== task.TimePlannedStart) {
    label += ` → ${fmtDay(new Date(task.TimePlannedEnd))}`;
  }
  return label;
}

export const PRIORITY_ORDER = ["Urgent", "High", "Medium", "Low"] as const;
const priRank = (p: string) => {
  const i = PRIORITY_ORDER.indexOf(p as (typeof PRIORITY_ORDER)[number]);
  return i < 0 ? 99 : i;
};

export type TaskGroup = {
  key: string;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string; // stage color for tint/stroke
  tone?: "danger" | "muted" | "default";
  priority?: string;
  order: number;
  tasks: TaskWithProject[];
};

function timeBucket(
  task: TaskWithProject,
  field: "timePlanned" | "timeCompleted",
  gran: Granularity,
  today: Date,
): Omit<TaskGroup, "tasks"> {
  const raw =
    field === "timePlanned" ? task.TimePlannedStart : task.TimeCompleted;
  if (!raw) {
    const label = field === "timeCompleted" ? "Not completed" : "No date";
    return {
      key: "__none",
      label,
      icon: "circle-dashed",
      tone: "muted",
      order: Number.MAX_SAFE_INTEGER,
    };
  }
  const d = new Date(raw);
  const isPlanned = field === "timePlanned";

  if (isPlanned && !task.TimeCompleted) {
    const overdue =
      (gran === "day" && dayDiff(d, today) < 0) ||
      (gran === "week" && weekDiff(d, today) < 0) ||
      (gran === "month" &&
        d.getFullYear() * 12 + d.getMonth() <
          today.getFullYear() * 12 + today.getMonth());
    if (overdue)
      return {
        key: "__overdue",
        label: "Overdue",
        icon: "circle-alert",
        tone: "danger",
        order: -1e9,
      };
  }

  if (gran === "day") {
    const diff = dayDiff(d, today);
    const ds = startOfDay(d);
    const label =
      diff === 0
        ? "Today"
        : diff === 1
          ? "Tomorrow"
          : diff === -1
            ? "Yesterday"
            : fmtDayFull(ds);
    return {
      key: "d" + ds.getTime(),
      label,
      sublabel:
        diff === 0 || diff === 1 || diff === -1 ? fmtDay(ds) : undefined,
      icon: "calendar",
      order: diff,
    };
  }
  if (gran === "month") {
    const mDiff =
      d.getFullYear() * 12 +
      d.getMonth() -
      (today.getFullYear() * 12 + today.getMonth());
    const label =
      mDiff === 0
        ? "This month"
        : mDiff === 1
          ? "Next month"
          : mDiff === -1
            ? "Last month"
            : fmtMonth(d);
    return {
      key: "m" + d.getFullYear() + "-" + d.getMonth(),
      label,
      sublabel:
        mDiff === 0 || mDiff === 1 || mDiff === -1 ? fmtMonth(d) : undefined,
      icon: "calendar-days",
      order: mDiff,
    };
  }
  // week (default)
  const ws = startOfWeek(d);
  const diff = weekDiff(d, today);
  const label =
    diff === 0
      ? "This week"
      : diff === 1
        ? "Next week"
        : diff === -1
          ? "Last week"
          : fmtWeekRange(ws);
  return {
    key: "w" + ws.getTime(),
    label,
    sublabel:
      diff === 0 || diff === 1 || diff === -1 ? fmtWeekRange(ws) : undefined,
    icon: "calendar",
    order: diff,
  };
}

export type GroupingData = {
  projectById: Record<number, { Name: string }>;
  stageById: Record<number, { Name: string; Icon: string; Color: string }>;
};

function categoryBucket(
  task: TaskWithProject,
  dim: GroupByKey,
  data: GroupingData,
): Omit<TaskGroup, "tasks"> {
  switch (dim) {
    case "project": {
      const name =
        data.projectById[task.ProjectID]?.Name ?? `Project ${task.ProjectID}`;
      return {
        key: "p" + task.ProjectID,
        label: name,
        icon: "folder",
        order: task.ProjectID,
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
        ? {
            key: "a-" + task.Assignee,
            label: task.Assignee,
            icon: "user",
            order: task.Assignee.charCodeAt(0),
          }
        : {
            key: "a-none",
            label: "Not assigned",
            icon: "user",
            tone: "muted",
            order: 1e6,
          };
    case "checklist": {
      const projName =
        data.projectById[task.ProjectID]?.Name ?? `Project ${task.ProjectID}`;
      return {
        key: "cl-" + task.ProjectID + "-" + task.Checklist,
        label: task.ChecklistName,
        sublabel: projName,
        icon: "land-plot",
        order: task.ProjectID * 1000 + task.Checklist,
      };
    }
    default:
      return { key: "other", label: "Other", order: 0 };
  }
}

function sortTasks(tasks: TaskWithProject[]): TaskWithProject[] {
  return [...tasks].sort((a, b) => {
    const ad = a.TimePlannedStart
      ? new Date(a.TimePlannedStart).getTime()
      : Infinity;
    const bd = b.TimePlannedStart
      ? new Date(b.TimePlannedStart).getTime()
      : Infinity;
    if (ad !== bd) return ad - bd;
    return priRank(a.Priority) - priRank(b.Priority);
  });
}

export function buildGroups(
  tasks: TaskWithProject[],
  opts: {
    groupBy: GroupByKey;
    granularity: Granularity;
    today: Date;
    showEmpty: boolean;
    data: GroupingData;
  },
): TaskGroup[] {
  const { groupBy, granularity, today, showEmpty, data } = opts;
  const isTimeGroup = groupBy === "timePlanned" || groupBy === "timeCompleted";

  const map = new Map<string, TaskGroup>();
  for (const t of tasks) {
    const b = isTimeGroup
      ? timeBucket(
          t,
          groupBy as "timePlanned" | "timeCompleted",
          granularity,
          today,
        )
      : categoryBucket(t, groupBy, data);
    if (!map.has(b.key)) map.set(b.key, { ...b, tasks: [] });
    map.get(b.key)!.tasks.push(t);
  }

  // Inject canonical week buckets when showEmpty is on
  if (showEmpty && groupBy === "timePlanned" && granularity === "week") {
    const thisWeek = startOfWeek(today);
    const canon: Omit<TaskGroup, "tasks">[] = [
      {
        key: "__overdue",
        label: "Overdue",
        icon: "circle-alert",
        tone: "danger",
        order: -1e9,
      },
      {
        key: "w" + thisWeek.getTime(),
        label: "This week",
        sublabel: fmtWeekRange(thisWeek),
        icon: "calendar",
        order: 0,
      },
      {
        key: "w" + addDays(thisWeek, 7).getTime(),
        label: "Next week",
        sublabel: fmtWeekRange(addDays(thisWeek, 7)),
        icon: "calendar",
        order: 1,
      },
    ];
    for (const c of canon) {
      if (!map.has(c.key)) map.set(c.key, { ...c, tasks: [] });
    }
  }

  const groups = [...map.values()].sort((a, b) => a.order - b.order);
  for (const g of groups) g.tasks = sortTasks(g.tasks);
  return groups;
}

export function applyClientFilters(
  tasks: TaskWithProject[],
  search: string,
): TaskWithProject[] {
  if (!search.trim()) return tasks;
  const q = search.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      t.Name.toLowerCase().includes(q) || t.Assignee.toLowerCase().includes(q),
  );
}
