import type { Task } from "@/types/types";
import { createContext } from "react";

export type TaskContextType = {
  state: Task;
  setState: (task: Task) => void;
};

export const defaultTaskContextValue: TaskContextType = {
  state: {
    ID: 0,
    Name: "",
    Body: [],
    Checklist: 0,
    TimeCompleted: null,
    TimeCreated: new Date().toISOString(),
    TimeModified: new Date().toISOString(),
    TimePlannedStart: null,
    TimePlannedEnd: null,
    Assignee: "",
    Priority: "Low",
    Type: "Dev",
    Status: "Open",
  },
  setState: () => {},
};

export const TaskContext = createContext<TaskContextType>(
  defaultTaskContextValue,
);
