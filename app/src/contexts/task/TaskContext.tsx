import type { ChecklistTask } from "@/types/types";
import { createContext } from "react";

export type TaskContextType = {
  state: ChecklistTask;
  setState: (task: ChecklistTask) => void;
};

export const defaultTaskContextValue: TaskContextType = {
  state: {
    ID: 0,
    Name: "",
    Body: [],
    Checklist: 0,
    ChecklistName: "",
    TimeCompleted: null,
    TimeCreated: new Date().toISOString(),
    TimeModified: new Date().toISOString(),
    TimePlannedStart: null,
    TimePlannedEnd: null,
    HasTimePlannedStart: false,
    HasTimePlannedEnd: false,
    Assignee: "",
    Priority: "Low",
    Type: { ID: 0, Name: "", Description: "", Icon: "square-check", Color: "gray", IsDefault: false, Category: 0 },
    Stage: 0,
  },
  setState: () => {},
};

export const TaskContext = createContext<TaskContextType>(
  defaultTaskContextValue,
);
