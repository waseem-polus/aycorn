import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import {
  assigneeOptionSource,
  checklistOptionSource,
  priorityOptionSource,
  stageOptionSource,
  stageTypeOptionSource,
  taskTypeOptionSource,
} from "@/features/task-filters/option-groups";
import { useTaskFacetsQuery } from "@/features/task-filters/queries/useTaskFacetsQuery";
import { useProjectTaskTypesQuery } from "@/features/task-types/queries/useProjectTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";

/**
 * The values the condition builder offers on a project page. Project isn't
 * offered — the page is already scoped to one.
 */
export function useProjectConditionSources(): ConditionOptionSources {
  const { Project, Stages } = useContext(ProjectContext);
  const { data: facets = { assignees: [], checklists: [] } } = useTaskFacetsQuery(Project.ID);
  const { data: taskTypes = [] } = useProjectTaskTypesQuery(Project.ID);
  const { data: taskTypeCategories = [] } = useTaskTypeCategoriesQuery();

  return {
    checklist: checklistOptionSource(facets.checklists),
    stage: stageOptionSource(Stages),
    type: taskTypeOptionSource(taskTypes, taskTypeCategories),
    assignee: assigneeOptionSource(facets.assignees),
    priority: priorityOptionSource(),
    stageType: stageTypeOptionSource(),
  };
}
