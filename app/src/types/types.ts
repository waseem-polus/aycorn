export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
  TimeCreated: string;
};

export type Checklist = {
  ID: number;
  Name: string;
  TimeCreated: string;
};

export type Task = {
  ID: number;
  Name: string;
  Checklist: number;
  TimeCreated: string;
  TimeCompleted: string | null;
  TimePlanned: string | null;
  Assignee: string;
  Priority: "Urgent" | "High" | "Medium" | "Low";
  Type: "Test" | "Dev" | "Reminder";
  Status: "Open" | "Todo" | "Doing" | "Blocked" | "Done";
};

export type ChecklistTask = Task & {
  ChecklistName: Checklist["Name"];
};

export type ProjectDetails = {
  Project: Project;
  Checklists: Checklist[];
  Tasks: ChecklistTask[];
};
