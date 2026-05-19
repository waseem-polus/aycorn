import type {
  ChecklistDetails,
  ChecklistTask,
  Project,
  Stage,
  TaskFilter,
  Workflow,
} from "@/types/types";
import { createContext } from "react";

export type ViewSettings = {
  isTaskEditorOpen: boolean;
};
export const defaultViewSettings: ViewSettings = { isTaskEditorOpen: false };

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
    WorkflowName: "",
    Pinned: false,
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

  SetFilter: () => {},
  Filter: {
    Name: "",
    Checklist: [],
    Assignee: [],
    Priority: [],
    Type: [],
    Stage: [],
  },

  ViewSettings: defaultViewSettings,
  SetViewSettings: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
