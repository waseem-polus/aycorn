import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import {
  assigneeOptionSource,
  checklistOptionSource,
  priorityOptionSource,
  projectOptionSource,
  stageOptionSource,
  stageTypeOptionSource,
  taskTypeOptionSource,
} from "@/features/task-filters/option-groups";
import { useTaskFacetsQuery } from "@/features/task-filters/queries/useTaskFacetsQuery";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";

/** The values the condition builder offers on /upcoming, across every project. */
export function useUpcomingConditionSources(): ConditionOptionSources {
  const { data: facets = { assignees: [], checklists: [] } } = useTaskFacetsQuery();
  const { data: projects = [] } = useAllProjectsQuery();
  const { data: workflows = [] } = useAllWorkflowsQuery();
  const { data: stages = [] } = useAllStagesQuery();
  const { data: taskTypes = [] } = useTaskTypesQuery();
  const { data: taskTypeCategories = [] } = useTaskTypeCategoriesQuery();

  return {
    project: projectOptionSource(projects),
    checklist: checklistOptionSource(facets.checklists, projects),
    stage: stageOptionSource(stages, workflows),
    type: taskTypeOptionSource(taskTypes, taskTypeCategories),
    assignee: assigneeOptionSource(facets.assignees),
    priority: priorityOptionSource(),
    stageType: stageTypeOptionSource(),
  };
}
