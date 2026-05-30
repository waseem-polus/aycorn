import type { TEventColor } from "@/features/calendar/types";
import { STAGE_COLORS } from "@/features/stage/stage-palette";
import type { Task } from "@/types/types";

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

export function getTaskStartDate(task: Task): string {
  return task.TimePlannedStart ?? task.TimeCreated;
}

export function getTaskEndDate(task: Task): string {
  return task.TimePlannedEnd ?? task.TimePlannedStart ?? task.TimeCreated;
}
