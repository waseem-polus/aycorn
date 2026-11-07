import type { ProjectDetails } from "@/types/types";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import { appendTaskFilterParams } from "@/features/task-filters/task-query-params";
import { useQuery } from "@tanstack/react-query";

export function useProjectDetailsQuery(
  projectId: number,
  filters: TaskFilterState,
  enabled: boolean,
  /**
   * The month and week views group by planned date, so their planned filter is
   * left out of the request even though it stays set in the drawer.
   */
  plannedFilterApplies = true,
  /** Always applied — unlike the basic planned filter, a condition is explicit logic the user wrote. */
  conditions: WireGroup[] = [],
) {
  const { isPending, error, data, isFetching, refetch } = useQuery<ProjectDetails>({
    queryKey: ["projectDetails", projectId, filters, plannedFilterApplies, conditions],
    enabled: enabled,
    queryFn: async () => {
      const url = new URL(`/api/project/${projectId}`, window.location.origin);
      url.searchParams.set("search", filters.search);
      appendTaskFilterParams(url, filters, conditions, { skipPlanned: !plannedFilterApplies });

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());

      return res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
