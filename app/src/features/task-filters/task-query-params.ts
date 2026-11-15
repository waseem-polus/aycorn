import type { WireGroup } from "@/features/task-filters/conditions/condition-types";

/**
 * Writes a task listing's condition trees onto its request URL — shared by
 * every endpoint that runs `parseTaskFilters` on the server. Each tree (the
 * Filter popover's, a quick filter, a view's source) is its own `conditions`
 * param, and the server ANDs them all.
 */
export const appendTaskFilterParams = (url: URL, conditions: WireGroup[]) => {
  for (const tree of conditions) {
    url.searchParams.append("conditions", JSON.stringify(tree));
  }
};
