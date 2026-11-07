import { isSameDay, parseISO } from "date-fns";
import { DATE_GROUP_KEYS } from "@/features/views/view-groupings";
import type { GroupByKey } from "@/features/views/view-types";
import { getTaskEndDate, getTaskStartDate } from "@/features/calendar/interfaces";
import type { Task } from "@/types/types";

/**
 * Which of a task's dates a calendar places it by — a month/week view's
 * grouping. Planned is a start→end span the user can drag and resize; the
 * others are moments in the task's history, drawn as short point events and
 * read-only.
 */
export type CalendarDateField = Extract<
  GroupByKey,
  "timePlanned" | "timeCreated" | "timeModified" | "timeCompleted"
>;

/** The date a calendar view places tasks by; anything else falls back to planned. */
export const calendarDateField = (groupBy: GroupByKey | null): CalendarDateField =>
  groupBy !== null && DATE_GROUP_KEYS.includes(groupBy)
    ? (groupBy as CalendarDateField)
    : "timePlanned";

/** Only planned dates are the user's to move; the rest are history. */
export const isReschedulable = (field: CalendarDateField) => field === "timePlanned";

const hasCalendarDate = (task: Task, field: CalendarDateField) => {
  switch (field) {
    case "timePlanned":
      return task.TimePlannedStart !== null;
    case "timeCompleted":
      return task.TimeCompleted !== null;
    case "timeCreated":
    case "timeModified":
      return true;
  }
};

/**
 * Splits tasks into the calendar's single- and multi-day rows by `field`.
 * Tasks without that date have no cell to live in and are left out.
 */
export const splitCalendarEvents = <T extends Task>(
  tasks: T[],
  field: CalendarDateField,
) => {
  const singleDayEvents: T[] = [];
  const multiDayEvents: T[] = [];
  for (const task of tasks) {
    if (!hasCalendarDate(task, field)) continue;
    const start = parseISO(getTaskStartDate(task, field));
    const end = parseISO(getTaskEndDate(task, field));
    (isSameDay(start, end) ? singleDayEvents : multiDayEvents).push(task);
  }
  return { singleDayEvents, multiDayEvents };
};
