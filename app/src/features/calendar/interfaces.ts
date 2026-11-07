import { addMinutes, endOfDay, parseISO } from "date-fns";
import type { CalendarDateField } from "@/features/calendar/date-field";
import type { TEventColor } from "@/features/calendar/types";
import { STAGE_COLORS } from "@/features/stage/stage-palette";
import type { Task } from "@/types/types";
import { toApiDate } from "@/utils/date";

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}

const VALID_COLORS = new Set<string>(STAGE_COLORS);

export function getTaskColor(task: Task): TEventColor {
  const color = task.Type?.Color;
  return (VALID_COLORS.has(color) ? color : "gray") as TEventColor;
}

/** How long a point-in-time date (created, completed, …) is drawn on the week grid. */
const POINT_EVENT_MINUTES = 30;

/**
 * Where `task` starts on a calendar placing tasks by `field`. A task missing
 * that date falls back to its creation time; calendar wrappers leave such
 * tasks out (`splitCalendarEvents`), so this only keeps the type a string.
 */
export function getTaskStartDate(
  task: Task,
  field: CalendarDateField = "timePlanned",
): string {
  switch (field) {
    case "timePlanned":
      return task.TimePlannedStart ?? task.TimeCreated;
    case "timeCompleted":
      return task.TimeCompleted ?? task.TimeCreated;
    case "timeModified":
      return task.TimeModified;
    case "timeCreated":
      return task.TimeCreated;
  }
}

/**
 * Where `task` ends. Planned dates span start→end; every other date is a
 * moment, drawn as a short block that never spills into the next day.
 */
export function getTaskEndDate(
  task: Task,
  field: CalendarDateField = "timePlanned",
): string {
  if (field === "timePlanned") {
    return task.TimePlannedEnd ?? task.TimePlannedStart ?? task.TimeCreated;
  }
  const start = parseISO(getTaskStartDate(task, field));
  const end = addMinutes(start, POINT_EVENT_MINUTES);
  const dayEnd = endOfDay(start);
  return toApiDate(end > dayEnd ? dayEnd : end);
}
