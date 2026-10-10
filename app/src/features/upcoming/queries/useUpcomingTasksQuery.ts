import type { TaskWithProject } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import {
  setPresence,
  setRangeEnd,
  setRangeStart,
} from "@/features/task-filters/date-params";

// Search is applied client-side for instant feedback; exclude it from the query key
// so typing doesn't trigger a backend round-trip.
type BackendFilters = Omit<TaskFilterState, "search">;

function toBackendFilters(filters: TaskFilterState): BackendFilters {
  const { search: _s, ...rest } = filters;
  return rest;
}

export function useUpcomingTasksQuery(filters: TaskFilterState) {
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
        plannedMode,
        completedMode,
        plannedFrom,
        plannedTo,
        plannedToHasTime,
        completedFrom,
        completedTo,
        completedToHasTime,
      } = backendFilters.dates ?? {};
      if (setPresence(url, "plannedPresence", plannedMode)) {
        setRangeStart(url, "plannedFrom", plannedFrom);
        setRangeEnd(url, "plannedTo", plannedTo, plannedToHasTime);
      }
      if (setPresence(url, "completedPresence", completedMode)) {
        setRangeStart(url, "completedFrom", completedFrom);
        setRangeEnd(url, "completedTo", completedTo, completedToHasTime);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
