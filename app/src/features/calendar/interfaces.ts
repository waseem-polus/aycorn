import type { TEventColor } from "@/features/calendar/types";
import type { Task, Type } from "@/types/types";

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

export function getColorForTaskType(type: Type): TEventColor {
  switch (type) {
    case "Dev":
      return "green";
    case "Reminder":
      return "orange";
    case "Test":
      return "blue";
    default:
      return "blue";
  }
}

export function getTaskColor(task: Task): TEventColor {
  return getColorForTaskType(task.Type);
}

export function getTaskStartDate(task: Task): string {
  return task.TimePlannedStart ?? task.TimeCreated;
}

export function getTaskEndDate(task: Task): string {
  return task.TimePlannedEnd ?? task.TimePlannedStart ?? task.TimeCreated;
}
