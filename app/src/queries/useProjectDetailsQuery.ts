import type { ProjectDetails } from "@/types/types";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import {
  setConditions,
  setPresence,
  setRangeEnd,
  setRangeStart,
} from "@/features/task-filters/date-params";
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
  conditions: WireGroup | null = null,
) {
  const { isPending, error, data, isFetching, refetch } = useQuery<ProjectDetails>({
    queryKey: ["projectDetails", projectId, filters, plannedFilterApplies, conditions],
    enabled: enabled,
    queryFn: async () => {
      const url = new URL(`/api/project/${projectId}`, window.location.origin);
      url.searchParams.set("search", filters.search);

      filters.checklist.forEach((id) =>
        url.searchParams.append("checklist", String(id)),
      );
      filters.type.forEach((id) => url.searchParams.append("typeId", String(id)));
      filters.stage.forEach((id) => url.searchParams.append("stage", String(id)));
      filters.priority.forEach((p) => url.searchParams.append("priority", p));
      filters.assignee.forEach((a) => url.searchParams.append("assignee", a));

      const {
        plannedMode,
        completedMode,
        plannedFrom,
        plannedTo,
        plannedToHasTime,
        completedFrom,
        completedTo,
        completedToHasTime,
      } = filters.dates ?? {};
      if (
        plannedFilterApplies &&
        setPresence(url, "plannedPresence", plannedMode)
      ) {
        setRangeStart(url, "plannedFrom", plannedFrom);
        setRangeEnd(url, "plannedTo", plannedTo, plannedToHasTime);
      }
      if (setPresence(url, "completedPresence", completedMode)) {
        setRangeStart(url, "completedFrom", completedFrom);
        setRangeEnd(url, "completedTo", completedTo, completedToHasTime);
      }
      setConditions(url, conditions);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());

      return res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
