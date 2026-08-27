import { type ReactNode } from "react";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { UpcomingProjectDetailsLoader } from "@/features/upcoming/upcoming-project-details-loader";
import type { ChecklistTask, Project } from "@/types/types";

/**
 * Supplies the per-task `ProjectContext` that the task editor drawer reads.
 *
 * The calendar views are project-agnostic, but /upcoming is cross-project, so
 * each task needs its own provider. Mirrors what `UpcomingTaskRow` already does
 * for list rows: seed with the project we already have, then lazily load the
 * rest (workflow, stages, checklists) only once the drawer opens.
 */
export function makeUpcomingTaskScope(
  projectIdByTaskId: Record<number, number>,
  projectById: Record<number, Project>,
) {
  return function UpcomingTaskScope({
    task,
    open,
    children,
  }: {
    task: ChecklistTask;
    open: boolean;
    children: ReactNode;
  }) {
    const projectId = projectIdByTaskId[task.ID];
    return (
      <ProjectProvider defaultState={projectById[projectId]}>
        <UpcomingProjectDetailsLoader projectId={projectId} open={open} />
        {children}
      </ProjectProvider>
    );
  };
}
