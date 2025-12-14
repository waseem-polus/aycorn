import type { Checklist, ChecklistTask, Project } from "@/types/types";
import { createContext } from "react";

export type ProjectContextType = {
  Project: Project;
  SetProject: (project: Project) => void;

  Tasks: ChecklistTask[];
  SetTasks: (tasks: ChecklistTask[]) => void;

  Checklists: Checklist[];
  SetChecklists: (checklists: Checklist[]) => void;
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
  SetProject: () => {},
  SetTasks: () => {},
  SetChecklists: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
