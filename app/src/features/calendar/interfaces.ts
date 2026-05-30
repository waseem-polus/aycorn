import type { TEventColor } from "@/features/calendar/types";
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

const COLOR_MAP: Record<string, TEventColor> = {
  green: "green",
  emerald: "green",
  teal: "green",
  lime: "green",
  orange: "orange",
  amber: "orange",
  yellow: "orange",
  blue: "blue",
  sky: "blue",
  cyan: "blue",
  indigo: "blue",
  red: "red",
  rose: "red",
  pink: "red",
  purple: "purple",
  violet: "purple",
  fuchsia: "purple",
  gray: "gray",
  slate: "gray",
};

export function getTaskColor(task: Task): TEventColor {
  return COLOR_MAP[task.Type?.Color] ?? "blue";
}

export function getTaskStartDate(task: Task): string {
  return task.TimePlannedStart ?? task.TimeCreated;
}

export function getTaskEndDate(task: Task): string {
  return task.TimePlannedEnd ?? task.TimePlannedStart ?? task.TimeCreated;
}
