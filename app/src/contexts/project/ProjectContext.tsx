import type {
  Checklist,
  ChecklistTask,
  Project,
  TaskFilter,
} from "@/types/types";
import { createContext } from "react";

export type ProjectContextType = {
  Project: Project;
  SetProject: (project: Project) => void;

  Tasks: ChecklistTask[];
  SetTasks: (tasks: ChecklistTask[]) => void;

  Checklists: Checklist[];
  SetChecklists: (checklists: Checklist[]) => void;

  Filter: TaskFilter;
  SetFilter: (filter: TaskFilter) => void;
};

export const defaultProjectContextValue: ProjectContextType = {
  Project: {
    ID: 0,
    Name: "",
    Pinned: false,
    TimeCreated: "",
  },
  Tasks: [],
  Checklists: [],
  Filter: {
    Name: "",
    Checklist: [],
    Assignee: [],
    Priority: [],
    Type: [],
    Status: ["Blocked", "Open", "Todo", "Doing"],
  },
  SetProject: () => {},
  SetTasks: () => {},
  SetChecklists: () => {},
  SetFilter: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
