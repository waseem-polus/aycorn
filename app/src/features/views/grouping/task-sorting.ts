import type { SortKey, SortRule } from "@/features/views/view-types";
import type { StageType, Task } from "@/types/types";

/** A task any view can sort: a project's or /upcoming's cross-project one. */
type SortableTask = Task & { ProjectID?: number; ChecklistName?: string };

/** Lookups for properties a task only holds as an id. */
export type SortData = {
  projectById: Record<number, { Name: string }>;
  stageById: Record<number, { Type?: StageType; Position?: number; Workflow?: number }>;
};

export const PRIORITY_ORDER = ["Urgent", "High", "Medium", "Low"] as const;
export const priRank = (p: string) => {
  const i = PRIORITY_ORDER.indexOf(p as (typeof PRIORITY_ORDER)[number]);
  return i < 0 ? 99 : i;
};

export const STAGE_TYPE_ORDER: Record<StageType, number> = { open: 0, todo: 1, doing: 2, done: 3 };

const time = (raw: string | null) => (raw ? new Date(raw).getTime() : null);
const text = (s: string | undefined) => (s ? s : null);

/** Planned date first (unplanned last), then priority — the order with no sort set. */
const compareDefault = (a: Task, b: Task) => {
  const ad = time(a.TimePlannedStart) ?? Infinity;
  const bd = time(b.TimePlannedStart) ?? Infinity;
  if (ad !== bd) return ad - bd;
  return priRank(a.Priority) - priRank(b.Priority);
};

export const sortTasks = <T extends Task>(tasks: T[]): T[] => [...tasks].sort(compareDefault);

type Value = number | string | null;

/** Each property's sort value. Null means "empty": it sorts last either way. */
const VALUE: Record<SortKey, (t: SortableTask, data: SortData) => Value> = {
  name: (t) => text(t.Name.trim()),
  priority: (t) => priRank(t.Priority),
  // Stages order as their workflow lists them; workflows by id.
  stage: (t, d) => {
    const s = d.stageById[t.Stage];
    return s ? (s.Workflow ?? 0) * 10000 + (s.Position ?? 0) : null;
  },
  stageType: (t, d) => {
    const type = d.stageById[t.Stage]?.Type;
    return type ? STAGE_TYPE_ORDER[type] : null;
  },
  type: (t) => text(t.Type.Name),
  assignee: (t) => text(t.Assignee),
  checklist: (t) => text(t.ChecklistName),
  project: (t, d) => text(t.ProjectID !== undefined ? d.projectById[t.ProjectID]?.Name : undefined),
  timePlanned: (t) => time(t.TimePlannedStart),
  timeCompleted: (t) => time(t.TimeCompleted),
  timeCreated: (t) => time(t.TimeCreated),
  timeModified: (t) => time(t.TimeModified),
};

const compareValues = (a: Value, b: Value) =>
  typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
    : (a as number) - (b as number);

/**
 * A comparator for a view's sort rules, applied in order. Empty values sort
 * last whatever the direction; ties fall back to the default order, then id,
 * so the result is stable.
 */
export const compareTasks = (rules: SortRule[], data: SortData) => {
  const steps = rules.map((rule) => ({
    value: VALUE[rule.property],
    sign: rule.direction === "asc" ? 1 : -1,
  }));
  return (a: SortableTask, b: SortableTask) => {
    for (const { value, sign } of steps) {
      const av = value(a, data);
      const bv = value(b, data);
      if (av === null && bv === null) continue;
      if (av === null) return 1;
      if (bv === null) return -1;
      const diff = compareValues(av, bv);
      if (diff !== 0) return diff * sign;
    }
    return compareDefault(a, b) || a.ID - b.ID;
  };
};

/** Tasks in a view's sort order. With no rules the input order is kept as is. */
export const applySort = <T extends SortableTask>(tasks: T[], rules: SortRule[], data: SortData): T[] =>
  rules.length === 0 ? tasks : [...tasks].sort(compareTasks(rules, data));
