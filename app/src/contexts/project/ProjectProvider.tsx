import { useState } from "react";
import type { Checklist, Project, ChecklistTask } from "@/types/types";
import { defaultProjectContextValue, ProjectContext } from "./ProjectContext";

export function ProjectProvider({
  defaultState = defaultProjectContextValue.Project,
  children,
}: {
  defaultState?: Project;
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<Project>(defaultState);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);

  return (
    <ProjectContext.Provider
      value={{
        Project: project,
        SetProject: setProject,
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
