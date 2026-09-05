import { useQuery } from "@tanstack/react-query";
import type { ProjectWorkflowSettings } from "@/types/types";

export function useProjectWorkflowSettingsQuery(
  projectId: number,
  // staleTime is opt-in: the settings page wants this refetched on every mount,
  // but hover-gated callers re-enable the query on each hover and would
  // otherwise refire the request every time.
  { enabled = true, staleTime = 0 }: { enabled?: boolean; staleTime?: number } = {},
) {
  const { isPending, error, data, isFetching, refetch } =
    useQuery<ProjectWorkflowSettings>({
      queryKey: ["projectWorkflowSettings", projectId],
      queryFn: async () => {
        const res = await fetch(
          `/api/project/${projectId}/settings/workflow`,
        );
        return await res.json();
      },
      enabled,
      staleTime,
    });

  return { isPending, error, data, isFetching, refetch };
}
