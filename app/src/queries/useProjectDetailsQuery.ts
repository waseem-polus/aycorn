import type { ProjectDetails } from "@/types/types";
import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import { appendTaskFilterParams } from "@/features/task-filters/task-query-params";
import { useQuery } from "@tanstack/react-query";

export function useProjectDetailsQuery(
  projectId: number,
  search: string,
  enabled: boolean,
  /** Condition trees, each ANDed: the view's source and the toggled quick filters. */
  conditions: WireGroup[] = [],
) {
  const { isPending, error, data, isFetching, refetch } = useQuery<ProjectDetails>({
    queryKey: ["projectDetails", projectId, search, conditions],
    enabled: enabled,
    queryFn: async () => {
      const url = new URL(`/api/project/${projectId}`, window.location.origin);
      url.searchParams.set("search", search);
      appendTaskFilterParams(url, conditions);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());

      return res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
