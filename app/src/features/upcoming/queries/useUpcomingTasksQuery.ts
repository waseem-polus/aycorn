import type { TaskWithProject } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";

// Search is applied client-side for instant feedback; exclude it from the query key
// so typing doesn't trigger a backend round-trip.
type BackendFilters = Omit<UpcomingFilters, "search">;

function toBackendFilters(filters: UpcomingFilters): BackendFilters {
  const { search: _s, ...rest } = filters;
  return rest;
}

export function useUpcomingTasksQuery(filters: UpcomingFilters) {
  const backendFilters = toBackendFilters(filters);
  return useQuery<TaskWithProject[]>({
    queryKey: ["upcomingTasks", backendFilters],
    queryFn: async () => {
      const url = new URL("/api/tasks", window.location.origin);
      backendFilters.project.forEach((id) => url.searchParams.append("project", String(id)));
      backendFilters.stage.forEach((id) => url.searchParams.append("stage", String(id)));
      backendFilters.type.forEach((id) => url.searchParams.append("typeId", String(id)));
      backendFilters.priority.forEach((p) => url.searchParams.append("priority", p));
      backendFilters.assignee.forEach((a) => url.searchParams.append("assignee", a));
      backendFilters.checklist.forEach((id) => url.searchParams.append("checklist", String(id)));
      const {
        plannedFrom,
        plannedTo,
        plannedFromHasTime,
        plannedToHasTime,
        completedFrom,
        completedTo,
        completedFromHasTime,
        completedToHasTime,
      } = backendFilters.dates ?? {};
      if (plannedFrom) url.searchParams.set("plannedFrom", plannedFrom);
      if (plannedFrom && plannedFromHasTime) url.searchParams.set("plannedFromHasTime", "true");
      if (plannedTo) url.searchParams.set("plannedTo", plannedTo);
      if (plannedTo && plannedToHasTime) url.searchParams.set("plannedToHasTime", "true");
      if (completedFrom) url.searchParams.set("completedFrom", completedFrom);
      if (completedFrom && completedFromHasTime) url.searchParams.set("completedFromHasTime", "true");
      if (completedTo) url.searchParams.set("completedTo", completedTo);
      if (completedTo && completedToHasTime) url.searchParams.set("completedToHasTime", "true");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
