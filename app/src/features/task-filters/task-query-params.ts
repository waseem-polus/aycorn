import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import {
  setPresence,
  setRangeEnd,
  setRangeStart,
} from "@/features/task-filters/date-params";
import type { PersistedFilterState } from "@/features/task-filters/task-filters";

/**
 * Writes a task listing's filters onto its request URL — shared by every
 * endpoint that runs `parseTaskFilters` on the server, so a new filter
 * dimension is one edit here. The ad-hoc filters become plain params; each
 * condition tree (a quick filter, a view's source) is its own `conditions`
 * param, and the server ANDs them all.
 */
export const appendTaskFilterParams = (
  url: URL,
  filters: PersistedFilterState,
  conditions: WireGroup[],
) => {
  filters.project.forEach((id) => url.searchParams.append("project", String(id)));
  filters.checklist.forEach((id) => url.searchParams.append("checklist", String(id)));
  filters.stage.forEach((id) => url.searchParams.append("stage", String(id)));
  filters.type.forEach((id) => url.searchParams.append("typeId", String(id)));
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
  if (setPresence(url, "plannedPresence", plannedMode)) {
    setRangeStart(url, "plannedFrom", plannedFrom);
    setRangeEnd(url, "plannedTo", plannedTo, plannedToHasTime);
  }
  if (setPresence(url, "completedPresence", completedMode)) {
    setRangeStart(url, "completedFrom", completedFrom);
    setRangeEnd(url, "completedTo", completedTo, completedToHasTime);
  }

  for (const tree of conditions) {
    url.searchParams.append("conditions", JSON.stringify(tree));
  }
};
