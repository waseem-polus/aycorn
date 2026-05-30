import type { TaskType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useProjectTaskTypesQuery(projectId: number) {
  return useQuery<TaskType[]>({
    queryKey: ["projectTaskTypes", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/settings/task-types/enabled`);
      return res.json();
    },
    enabled: projectId > 0,
  });
}
