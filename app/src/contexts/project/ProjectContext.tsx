import type {
  ChecklistDetails,
  ChecklistTask,
  Project,
  Stage,
  Workflow,
} from "@/types/types";
import { createContext } from "react";

export type ProjectContextType = {
  Project: Project;
  SetProject: (project: Project) => void;

  Workflow: Workflow;
  SetWorkflow: (workflow: Workflow) => void;

  Stages: Stage[];
  SetStages: (stages: Stage[]) => void;

  Tasks: ChecklistTask[];
  SetTasks: (tasks: ChecklistTask[]) => void;

  Checklists: ChecklistDetails[];
  SetChecklists: (checklists: ChecklistDetails[]) => void;
};

export const defaultProjectContextValue: ProjectContextType = {
  SetProject: () => {},
  Project: {
    ID: 0,
    Name: "",
    Icon: "folder",
    Color: "gray",
    WorkflowName: "",
    Pinned: false,
    Archived: false,
    Folder: 0,
    Workflow: 0,
    TimeCreated: "",
    TimeModified: "",
  },

  SetWorkflow: () => {},
  Workflow: {
    ID: 0,
    Name: "",
    Description: "",
    TimeCreated: "",
    TimeModified: "",
  },

  SetStages: () => {},
  Stages: [],

  SetTasks: () => {},
  Tasks: [],

  SetChecklists: () => {},
  Checklists: [],
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
