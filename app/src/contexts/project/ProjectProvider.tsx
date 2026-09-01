import { useState } from "react";
import type {
  ChecklistDetails,
  ChecklistTask,
  Project,
  Stage,
  Workflow,
} from "@/types/types";
import { defaultProjectContextValue, ProjectContext } from "./ProjectContext";

export function ProjectProvider({
  defaultState = defaultProjectContextValue.Project,
  children,
}: {
  defaultState?: Project;
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<Project>(defaultState);
  const [workflow, setWorkflow] = useState<Workflow>(
    defaultProjectContextValue.Workflow,
  );
  const [stages, setStages] = useState<Stage[]>([]);
  const [checklists, setChecklists] = useState<ChecklistDetails[]>([]);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  return (
    <ProjectContext.Provider
      value={{
        Project: project,
        SetProject: setProject,

        Workflow: workflow,
        SetWorkflow: setWorkflow,

        Stages: stages,
        SetStages: setStages,

        Tasks: tasks,
        SetTasks: setTasks,

        Checklists: checklists,
        SetChecklists: setChecklists,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
