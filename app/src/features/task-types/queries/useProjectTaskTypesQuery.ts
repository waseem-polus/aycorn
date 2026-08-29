import type { TaskType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Types that at least one task in this project already uses.
 *
 * Every task type is usable in every project, so this is not a list of what's
 * *allowed* — it's what's actually present. It backs the project's type filters,
 * which would otherwise offer options that match nothing.
 */
export function useProjectTaskTypesQuery(projectId: number) {
  return useQuery<TaskType[]>({
    queryKey: ["projectTaskTypes", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/task-types/in-use`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: projectId > 0,
  });
}
