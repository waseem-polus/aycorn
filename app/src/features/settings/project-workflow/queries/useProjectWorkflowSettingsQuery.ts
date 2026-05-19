import { useQuery } from "@tanstack/react-query";
import type { ProjectWorkflowSettings } from "@/types/types";

export function useProjectWorkflowSettingsQuery(
  projectId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { isPending, error, data, isFetching, refetch } =
    useQuery<ProjectWorkflowSettings>({
      queryKey: ["projectWorkflowSettings", projectId],
      queryFn: async () => {
        const res = await fetch(
          `http://localhost:8000/api/project/${projectId}/settings/workflow`,
        );
        return await res.json();
      },
      enabled,
    });

  return { isPending, error, data, isFetching, refetch };
}
