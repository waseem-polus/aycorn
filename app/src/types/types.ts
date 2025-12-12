export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
};

export type Task = {
  ID: number;
  Name: string;
  TimeCompleted: string | null;
  TimeStarted: string | null;
  TimePlanned: string | null;
  Assignee: string;
  Priority: "Urgent" | "High" | "Medium" | "Low";
  Type: "Test" | "Dev" | "Reminder";
  Status: "Open" | "Todo" | "Doing" | "Blocked" | "Done";
};

export type ProjectDetails = {
  Project: Project;
  Tasks: (Task & {
    Checklist: number;
    ChecklistName: string;
  })[];
};
