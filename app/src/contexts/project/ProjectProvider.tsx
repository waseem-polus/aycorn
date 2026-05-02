import { useState } from "react";
import type {
  Checklist,
  Project,
  ChecklistTask,
  TaskFilter,
} from "@/types/types";
import {
  defaultProjectContextValue,
  defaultViewSettings,
  ProjectContext,
  type ViewSettings,
} from "./ProjectContext";

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
  const [filters, setFilters] = useState<TaskFilter>(
    defaultProjectContextValue.Filter,
  );
  const [viewSettings, setViewSettings] =
    useState<ViewSettings>(defaultViewSettings);

  return (
    <ProjectContext.Provider
      value={{
        Project: project,
        SetProject: setProject,

        Tasks: tasks,
        SetTasks: setTasks,

        Checklists: checklists,
        SetChecklists: setChecklists,

        Filter: filters,
        SetFilter: setFilters,

        ViewSettings: viewSettings,
        SetViewSettings: setViewSettings,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
