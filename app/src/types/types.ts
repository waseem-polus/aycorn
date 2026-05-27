import type { Value } from "platejs";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const TYPES = ["Test", "Dev", "Reminder"] as const;
export const STAGE_TYPES = ["open", "todo", "doing", "done", "blocked"] as const;

export type Type = (typeof TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type StageType = (typeof STAGE_TYPES)[number];

export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
  Workflow: number;
  WorkflowName: string;
  TimeCreated: string;
  TimeModified: string;
};

export type Workflow = {
  ID: number;
  Name: string;
  Description: string;
  TimeCreated: string;
  TimeModified: string;
};

export type WorkflowSummary = Workflow & {
  ProjectCount: number;
  StageCount: number;
  Stages: Stage[];
};

export type ProjectWorkflowSettings = {
  Project: Project;
  Workflow: Workflow;
  Stages: Stage[];
};

export type Stage = {
  ID: number;
  Workflow: number;
  Name: string;
  Description: string;
  Color: string;
  Icon: string;
  Position: number;
  Type: StageType;
  TaskCount: number;
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
  Status: StageType;
};

export type Task = {
  ID: number;
  Name: string;
  Body: Value;
  Checklist: number;
  Stage: number;
  TimeCreated: string;
  TimeModified: string;
  TimePlannedStart: string | null;
  TimePlannedEnd: string | null;
  HasTimePlannedStart: boolean;
  HasTimePlannedEnd: boolean;
  TimeCompleted: string | null;
  Assignee: string;
  Priority: Priority;
  Type: Type;
};

export type ChecklistTask = Task & {
  ChecklistName: Checklist["Name"];
};

export type TaskWithProject = ChecklistTask & {
  ProjectID: number;
};

export type ProjectDetails = {
  Project: Project;
  Workflow: Workflow;
  Stages: Stage[];
  Checklists: ChecklistDetails[];
  Tasks: ChecklistTask[];
};

export type TaskFilter = {
  Name: Task["Name"];
  Checklist: Task["Checklist"][];
  Assignee: Task["Assignee"][];
  Priority: Task["Priority"][];
  Type: Task["Type"][];
  Stage: Stage["ID"][];
};

export type BulkResult = {
  success: number;
  failed: number;
  skipped: number;
};

export type BulkDuplicateResult = BulkResult & {
  newIds: number[];
};
