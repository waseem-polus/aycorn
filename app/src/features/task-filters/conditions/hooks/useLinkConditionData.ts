import { useMemo } from "react";
import { useAllTasksForRelationshipQuery } from "@/features/task/relationships/queries/useAllTasksForRelationshipQuery";
import { useTaskRelationshipTypesQuery } from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import { linkTaskOptionSource } from "@/features/task-filters/option-groups";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";

/**
 * What link conditions need on any surface: the relationship types (one
 * property per direction) and every task they can point at. Shares the
 * caches the relationship pickers already use, so opening the drawer after
 * adding a link costs nothing.
 */
export function useLinkConditionData() {
  const { data: linkTypes = [] } = useTaskRelationshipTypesQuery();
  const { data: tasks = [] } = useAllTasksForRelationshipQuery(true);
  const { data: projects = [] } = useAllProjectsQuery();
  const linkTaskSource = useMemo(
    () => linkTaskOptionSource(tasks, projects),
    [tasks, projects],
  );
  return { linkTypes, linkTaskSource };
}
