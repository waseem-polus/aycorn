import { createContext, useContext, type ReactNode } from "react";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { defaultProjectContextValue } from "@/contexts/project/ProjectContext";
import { UpcomingProjectDetailsLoader } from "@/features/upcoming/upcoming-project-details-loader";
import type { ChecklistTask, Project } from "@/types/types";

/**
 * The lookups `UpcomingTaskScope` needs, kept in a context rather than closed
 * over by a factory. A factory would mint a fresh component type every time the
 * task list refetched, and React unmounts the subtree when a component's
 * identity changes — closing the open task editor drawer mid-edit.
 */
type TaskScopeLookup = {
  /**
   * The calendar views hand back a bare `ChecklistTask`, so the owning project
   * is resolved through this map rather than by narrowing the type.
   */
  projectIdByTaskId: Map<number, number>;
  projectById: Record<number, Project>;
};

const TaskScopeLookupContext = createContext<TaskScopeLookup>({
  projectIdByTaskId: new Map(),
  projectById: {},
});

export function UpcomingTaskScopeProvider({
  lookup,
  children,
}: {
  lookup: TaskScopeLookup;
  children: ReactNode;
}) {
  return (
    <TaskScopeLookupContext.Provider value={lookup}>
      {children}
    </TaskScopeLookupContext.Provider>
  );
}

/**
 * Supplies the per-task `ProjectContext` that the task editor drawer reads.
 *
 * The calendar views are project-agnostic, but /upcoming is cross-project, so
 * each task needs its own provider. Mirrors what `UpcomingTaskRow` already does
 * for list rows: seed with the project we already have, then lazily load the
 * rest (workflow, stages, checklists) only once the drawer opens.
 */
export function UpcomingTaskScope({
  task,
  open,
  children,
}: {
  task: ChecklistTask;
  open: boolean;
  children: ReactNode;
}) {
  const { projectIdByTaskId, projectById } = useContext(TaskScopeLookupContext);
  const projectId = projectIdByTaskId.get(task.ID);

  // Nothing to scope to — the task isn't in the current result set.
  if (projectId === undefined) return <>{children}</>;

  // The project list may not have loaded yet. Seed with the ID alone so the
  // drawer's mutations target the right project from the first render; the
  // loader fills in the rest.
  const project = projectById[projectId] ?? {
    ...defaultProjectContextValue.Project,
    ID: projectId,
  };

  return (
    <ProjectProvider defaultState={project}>
      <UpcomingProjectDetailsLoader projectId={projectId} open={open} />
      {children}
    </ProjectProvider>
  );
}
