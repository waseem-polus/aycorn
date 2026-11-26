import { useNavigate } from "@tanstack/react-router";
import { defaultFilter } from "cmdk";
import { WorkflowIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type { CommandSection } from "@/features/command-palette/build-command-sections";
import type { PaletteCommand } from "@/features/command-palette/command-types";
import {
  entityKinds,
  entityScopes,
  type EntityKind,
} from "@/features/command-palette/entity-search/entity-scopes";
import { ProjectIcon } from "@/features/projects/project-icon";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useAllTasksForRelationshipQuery } from "@/features/task/relationships/queries/useAllTasksForRelationshipQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { cn } from "@/lib/utils";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";

/** Results per group when searching everything; a scoped search shows more. */
const GROUP_LIMIT = 6;
const SCOPED_LIMIT = 50;
const RECENT_SHOWN = 8;

type Ranked = { command: PaletteCommand; score: number };

/** Matches by title only (cmdk's fuzzy scorer), best first. */
const rank = (commands: PaletteCommand[], search: string): Ranked[] =>
  commands
    .map((command) => ({
      command,
      score: defaultFilter(command.title, search),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

/**
 * Entity search: tasks, projects and workflows found by title, as palette
 * entries that open the entity. Data loads only while search is shown.
 *
 * - No search: the most recently opened entities.
 * - Searching: one group per kind, groups ordered by their best match.
 */
export const useEntitySearch = ({
  search,
  scope,
  recentIds,
}: {
  search: string;
  scope: EntityKind | null;
  recentIds: string[];
}) => {
  const navigate = useNavigate();
  const wants = (kind: EntityKind) => scope === null || scope === kind;

  const tasksQuery = useAllTasksForRelationshipQuery(wants("task"));
  // Tasks need the project list too, for their project's name.
  const projectsQuery = useAllProjectsQuery(undefined, {
    enabled: wants("task") || wants("project"),
  });
  const workflowsQuery = useAllWorkflowsQuery({ enabled: wants("workflow") });

  const projects = projectsQuery.data ?? [];
  const projectName = new Map(
    projects.map((project) => [project.ID, project.Name || "Untitled Project"]),
  );

  const entries: Record<EntityKind, PaletteCommand[]> = {
    task: (tasksQuery.data ?? []).map((task) => ({
      id: `task:${task.ID}`,
      title: task.Name || "Untitled Task",
      group: "Task",
      icon: (
        <DynamicIcon
          name={(task.Type?.Icon || "square-check") as IconName}
          className={cn(
            "size-4 shrink-0",
            stageStrokeClass(task.Type?.Color ?? "gray"),
          )}
          fallback={() => <span className="size-4 shrink-0" />}
        />
      ),
      hint: projectName.get(task.ProjectID),
      run: () =>
        navigate({
          to: "/task/$taskId",
          params: { taskId: String(task.ID) },
        }),
    })),
    project: projects.map((project) => ({
      id: `project:${project.ID}`,
      title: project.Name || "Untitled Project",
      group: "Project",
      icon: <ProjectIcon project={project} />,
      hint: project.Archived ? "Archived" : undefined,
      run: () =>
        navigate({
          to: "/project/$projectId",
          params: { projectId: String(project.ID) },
        }),
    })),
    workflow: (workflowsQuery.data ?? []).map((workflow) => ({
      id: `workflow:${workflow.ID}`,
      title: workflow.Name || "Untitled Workflow",
      group: "Workflow",
      icon: WorkflowIcon,
      run: () =>
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(workflow.ID) },
        }),
    })),
  };

  const kinds = entityKinds.filter(wants);
  const isLoading =
    (wants("task") && tasksQuery.isPending) ||
    (wants("project") && projectsQuery.isPending) ||
    (wants("workflow") && workflowsQuery.isPending);

  let sections: CommandSection[];
  if (!search) {
    const byId = new Map(
      kinds.flatMap((kind) => entries[kind]).map((entry) => [entry.id, entry]),
    );
    const recent = recentIds
      .map((id) => byId.get(id))
      .filter((entry): entry is PaletteCommand => !!entry)
      .slice(0, RECENT_SHOWN);
    sections = recent.length
      ? [{ heading: "Recently opened", commands: recent }]
      : [];
  } else {
    const limit = scope ? SCOPED_LIMIT : GROUP_LIMIT;
    sections = kinds
      .map((kind) => ({ kind, ranked: rank(entries[kind], search) }))
      .filter(({ ranked }) => ranked.length > 0)
      // Stable sort: ties keep the kinds' own order.
      .sort((a, b) => b.ranked[0].score - a.ranked[0].score)
      .map(({ kind, ranked }) => ({
        heading: entityScopes[kind].label,
        commands: ranked.slice(0, limit).map((entry) => entry.command),
      }));
  }

  return { sections, isLoading };
};
