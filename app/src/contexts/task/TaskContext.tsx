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
    Checklist: 0,
    TimeCompleted: null,
    TimeCreated: new Date(),
    TimePlanned: null,
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
