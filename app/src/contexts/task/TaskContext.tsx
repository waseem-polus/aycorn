import type { ChecklistTask } from "@/types/types";
import { createContext } from "react";

export type TaskContextType = {
  state: ChecklistTask;
  setState: (task: ChecklistTask) => void;
};

export const defaultTaskContextValue: TaskContextType = {
  state: {
    Checklist: 0,
    ChecklistName: "",

    ID: 0,
    Name: "",
    TimeCompleted: null,
    TimeStarted: null,
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
