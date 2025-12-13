export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
};

export type Checklist = {
  ID: number;
  Name: string;
};

export type Task = {
  ID: number;
  Name: string;
  Checklist: number;
  TimeCompleted: Date | null;
  TimeStarted: Date | null;
  TimePlanned: Date | null;
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
  Tasks: ChecklistTask[];
};
