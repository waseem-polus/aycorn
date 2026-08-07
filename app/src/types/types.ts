import type { Value } from "platejs";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const STAGE_TYPES = ["open", "todo", "doing", "done"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type StageType = (typeof STAGE_TYPES)[number];
export type ChecklistStatus = "unused" | "doing" | "done";

export type TaskTypeCategory = {
  ID: number;
  Name: string;
  IsDefault: boolean;
  SortOrder: number;
};

export type TaskType = {
  ID: number;
  Name: string;
  Description: string;
  Icon: string;
  Color: string;
  IsDefault: boolean;
  Category: number;
};

export type TaskTypeGlobal = TaskType & {
  ProjectCount: number;
  TaskCount: number;
};

export type TaskTypeWithCount = TaskType & {
  TaskCount: number;
};

export type ProjectTaskTypeSettings = {
  AllTypes: TaskTypeWithCount[];
  EnabledTypeIDs: number[];
  Categories: TaskTypeCategory[];
};

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
  Description: string;
  TimeCreated: string;
  TimeModified: string;
  IsDefault: boolean;
};

export type StageCount = { StageID: number; Count: number };

export type ChecklistDetails = Checklist & {
  DoneCount: number;
  TotalCount: number;
  Status: ChecklistStatus;
  StageCounts: StageCount[];
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
  Type: TaskType;
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
  Type: number[];
  Stage: Stage["ID"][];
};

export const RELATIONSHIP_BEHAVIORS = ["blocking", "subtask", "link"] as const;
export type RelationshipBehavior = (typeof RELATIONSHIP_BEHAVIORS)[number];

export type TaskRelationshipType = {
  ID: number;
  FromName: string;
  ToName: string;
  Behavior: RelationshipBehavior;
  Icon: string;
  Color: string;
  IsSystem: boolean;
  UsageCount: number;
};

export type RelatedTask = {
  ID: number;
  Name: string;
  ProjectID: number;
  ProjectName: string;
  ChecklistName: string;
  Priority: Priority;
  IsDone: boolean;
  Stage: Stage;
  Type: TaskType;
};

export type TaskRelationship = {
  ID: number;
  Type: TaskRelationshipType;
  Direction: "from" | "to";
  Other: RelatedTask;
};

export type TaskRelationshipsResult = {
  Relationships: TaskRelationship[];
};

export type BulkResult = {
  success: number;
  failed: number;
  skipped: number;
};

export type BulkDuplicateResult = BulkResult & {
  newIds: number[];
};

export type ChecklistFacet = {
  id: number;
  name: string;
  projectId: number;
};

export type TaskFacets = {
  assignees: string[];
  checklists: ChecklistFacet[];
};
