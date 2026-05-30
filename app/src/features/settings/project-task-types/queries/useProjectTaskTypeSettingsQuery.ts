import type { ProjectTaskTypeSettings } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useProjectTaskTypeSettingsQuery(projectId: number) {
  return useQuery<ProjectTaskTypeSettings>({
    queryKey: ["projectTaskTypeSettings", projectId],
    queryFn: async () => {
      const res = await fetch(
        `/api/project/${projectId}/settings/task-types`,
      );
      return res.json();
    },
    enabled: projectId > 0,
  });
}
