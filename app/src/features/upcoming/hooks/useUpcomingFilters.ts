import { useBoardFilter } from "@/features/saved-filters/hooks/useBoardFilter";
import { useCollapsedGroups } from "@/features/views/hooks/useCollapsedGroups";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import type { BoardView, Granularity, GroupByKey } from "@/features/views/view-types";

export type UpcomingViewSettings = {
  /** Null for an ungrouped list. */
  groupBy: GroupByKey | null;
  granularity: Granularity;
};

const UPCOMING_BOARD = { surface: "upcoming" } as const;

/**
 * /upcoming's filters for the view being shown: its ad-hoc drawer filters
 * (remembered per view), the board's quick filters, and the view's grouping
 * and collapsed groups. Grouping lives on the view row, so changing it here
 * saves the view.
 */
export function useUpcomingFilters(view: BoardView | null, views: BoardViewsAPI) {
  const filtersApi = useBoardFilter(
    UPCOMING_BOARD,
    view ? `upcoming.view.${view.ID}` : "upcoming",
  );
  const collapsed = useCollapsedGroups(
    view ? `aycorn.upcoming.view.${view.ID}.collapsed` : "aycorn.upcoming.collapsed",
  );

  const settings: UpcomingViewSettings = {
    groupBy: view ? view.GroupBy : "timePlanned",
    granularity: view?.GroupOptions.granularity ?? "week",
  };

  const setGroupBy = (groupBy: GroupByKey | null) => {
    if (view) void views.update(view.ID, { groupBy });
  };

  const setGranularity = (granularity: Granularity) => {
    if (view) {
      void views.update(view.ID, {
        groupOptions: { ...view.GroupOptions, granularity },
      });
    }
  };

  return {
    ...filtersApi,
    view: settings,
    ...collapsed,
    setGroupBy,
    setGranularity,
  };
}
