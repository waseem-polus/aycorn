import { addDays } from "date-fns";
import { createCondition } from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionValue,
  DateRef,
  OperatorKey,
  StaticPropertyKey,
} from "@/features/task-filters/conditions/condition-types";
import {
  FILTER_DIMS,
  type DateFilterMode,
  type FilterDim,
  type PersistedFilterState,
} from "@/features/task-filters/task-filters";
import { parseApiDate, toYMD } from "@/utils/date";

/** Basic filter dimensions and the condition property each one becomes. */
const DIM_PROPERTY: Record<FilterDim, StaticPropertyKey> = {
  project: "project",
  stage: "stage",
  type: "type",
  priority: "priority",
  assignee: "assignee",
  checklist: "checklist",
};

const condition = (
  property: StaticPropertyKey,
  operator: OperatorKey,
  value: ConditionValue = null,
): Condition => ({ ...createCondition(property), operator, value });

const day = (iso: string, shift = 0): DateRef => ({
  kind: "absolute",
  date: toYMD(addDays(parseApiDate(iso), shift)),
});

/**
 * One date dimension as a condition. Basic ranges are inclusive and whole-day
 * by default, so an open-ended range maps onto the neighbouring day: "from
 * Nov 4" is "after Nov 3", "to Nov 4" is "before Nov 5". Picked times are
 * dropped — conditions compare whole days.
 */
const dateCondition = (
  property: "timePlanned" | "timeCompleted",
  mode: DateFilterMode | undefined,
  from: string | undefined,
  to: string | undefined,
): Condition | null => {
  if (!mode || mode === "all") return null;
  if (mode === "none") return condition(property, "is_not_set");
  if (from && to) {
    return condition(property, "between", { kind: "range", from: day(from), to: day(to) });
  }
  if (from) return condition(property, "after", { kind: "date", ref: day(from, -1) });
  if (to) return condition(property, "before", { kind: "date", ref: day(to, 1) });
  return condition(property, "is_set");
};

/**
 * The simple drawer filters as condition rows, ANDed — how ad-hoc filters
 * become a quick filter, and how pre-v3 saved filters fold their basic half
 * into the tree.
 */
export const basicToConditions = (basic: Partial<PersistedFilterState>): Condition[] => {
  const rows: Condition[] = [];
  for (const dim of FILTER_DIMS) {
    const ids = (basic[dim] ?? []) as (string | number)[];
    if (ids.length > 0) rows.push(condition(DIM_PROPERTY[dim], "is", { kind: "ids", ids }));
  }
  const dates = basic.dates ?? {};
  const planned = dateCondition("timePlanned", dates.plannedMode, dates.plannedFrom, dates.plannedTo);
  const completed = dateCondition(
    "timeCompleted",
    dates.completedMode,
    dates.completedFrom,
    dates.completedTo,
  );
  if (planned) rows.push(planned);
  if (completed) rows.push(completed);
  return rows;
};
