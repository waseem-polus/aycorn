import type { Value } from "platejs";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const TYPES = ["Test", "Dev", "Reminder"] as const;
export const STATUSES = ["Open", "Todo", "Doing", "Blocked", "Done"] as const;

export type Status = (typeof STATUSES)[number];
export type Type = (typeof TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];

export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
  TimeCreated: string;
  TimeModified: string;
};

export type Checklist = {
  ID: number;
  Name: string;
  TimeCreated: string;
  TimeModified: string;
  IsDefault: boolean;
};

export type ChecklistDetails = Checklist & {
  DoneCount: number;
  TotalCount: number;
  Status: Status;
};

export type Task = {
  ID: number;
  Name: string;
  Body: Value;
  Checklist: number;
  TimeCreated: string;
  TimeModified: string;
  TimePlannedStart: string | null;
  TimePlannedEnd: string | null;
  TimeCompleted: string | null;
  Assignee: string;
  Priority: Priority;
  Type: Type;
  Status: Status;
};

export type ChecklistTask = Task & {
  ChecklistName: Checklist["Name"];
};

export type ProjectDetails = {
  Project: Project;
  Checklists: ChecklistDetails[];
  Tasks: ChecklistTask[];
};

export type TaskFilter = {
  Name: Task["Name"];
  Checklist: Task["Checklist"][];
  Assignee: Task["Assignee"][];
  Priority: Task["Priority"][];
  Type: Task["Type"][];
  Status: Task["Status"][];
};
