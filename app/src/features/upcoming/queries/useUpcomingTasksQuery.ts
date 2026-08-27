import type { TaskWithProject } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import type {
  DateFilterMode,
  UpcomingFilters,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import { parseApiDate, toApiDate, toApiDayEnd } from "@/utils/date";

// Search is applied client-side for instant feedback; exclude it from the query key
// so typing doesn't trigger a backend round-trip.
type BackendFilters = Omit<UpcomingFilters, "search">;

function toBackendFilters(filters: UpcomingFilters): BackendFilters {
  const { search: _s, ...rest } = filters;
  return rest;
}

/**
 * Lower bound of a date range. Sent as-is: when the user picked a whole day
 * rather than a time, the stored value is already that day's local midnight,
 * which is exactly where the range should start.
 */
const setRangeStart = (url: URL, key: string, value: string | undefined) => {
  if (!value) return;
  url.searchParams.set(key, toApiDate(parseApiDate(value)));
};

/**
 * Upper bound of a date range. The server compares bounds inclusively against
 * stored instants, so a whole-day selection has to be extended to that day's
 * END — a range "through Aug 22" bounded at Aug 22 00:00 would exclude
 * everything that actually happened on Aug 22. When the user did specify a
 * time, their instant is the bound.
 */
const setRangeEnd = (
  url: URL,
  key: string,
  value: string | undefined,
  hasTime: boolean | undefined,
) => {
  if (!value) return;
  const date = parseApiDate(value);
  url.searchParams.set(key, hasTime ? toApiDate(date) : toApiDayEnd(date));
};

/**
 * Translates a date mode into the server's presence param and reports whether
 * range bounds still apply. "with" asks for tasks that have the date at all —
 * an unset range then means "any date" rather than "no filter".
 */
const setPresence = (url: URL, key: string, mode: DateFilterMode | undefined) => {
  const resolved = mode ?? "all";
  if (resolved === "all") return false;
  url.searchParams.set(key, resolved === "none" ? "none" : "any");
  return resolved === "with";
};

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
