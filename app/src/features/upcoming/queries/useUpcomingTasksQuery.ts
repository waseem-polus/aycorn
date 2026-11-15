import type { TaskWithProject } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import { controlsArchived } from "@/features/task-filters/conditions/condition-wire";
import { appendTaskFilterParams } from "@/features/task-filters/task-query-params";

export function useUpcomingTasksQuery(
  conditions: WireGroup[],
  enabled = true,
) {
  // Search is applied client-side for instant feedback, so it isn't part of
  // the query: typing doesn't trigger a backend round-trip.
  return useQuery<TaskWithProject[]>({
    queryKey: ["upcomingTasks", conditions],
    enabled,
    queryFn: async () => {
      const url = new URL("/api/tasks", window.location.origin);
      appendTaskFilterParams(url, conditions);
      // Archived projects' tasks are hidden here unless a condition decides.
      if (!controlsArchived(conditions)) url.searchParams.set("excludeArchived", "true");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
