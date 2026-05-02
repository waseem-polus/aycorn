import type {
  ChecklistDetails,
  ChecklistTask,
  Project,
  TaskFilter,
} from "@/types/types";
import { createContext } from "react";

export type ViewSettings = {
  isTaskEditorOpen: boolean;
};
export const defaultViewSettings: ViewSettings = { isTaskEditorOpen: false };

export type ProjectContextType = {
  Project: Project;
  SetProject: (project: Project) => void;

  Tasks: ChecklistTask[];
  SetTasks: (tasks: ChecklistTask[]) => void;

  Checklists: ChecklistDetails[];
  SetChecklists: (checklists: ChecklistDetails[]) => void;

  Filter: TaskFilter;
  SetFilter: (filter: TaskFilter) => void;

  ViewSettings: ViewSettings;
  SetViewSettings: (settings: ViewSettings) => void;
};

export const defaultProjectContextValue: ProjectContextType = {
  SetProject: () => {},
  Project: {
    ID: 0,
    Name: "",
    Pinned: false,
    TimeCreated: "",
  },

  SetTasks: () => {},
  Tasks: [],

  SetChecklists: () => {},
  Checklists: [],

  SetFilter: () => {},
  Filter: {
    Name: "",
    Checklist: [],
    Assignee: [],
    Priority: [],
    Type: [],
    Status: ["Blocked", "Open", "Todo", "Doing"],
  },

  ViewSettings: defaultViewSettings,
  SetViewSettings: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
