import { useLocalStorage } from "@/features/calendar/hooks";
import { useBoardFilter } from "@/features/saved-filters/hooks/useBoardFilter";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import type { BoardView, Granularity, GroupByKey } from "@/features/views/view-types";

export type UpcomingViewSettings = {
  groupBy: GroupByKey;
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
  const [collapsedKeys, setCollapsedKeys] = useLocalStorage<string[]>(
    view ? `aycorn.upcoming.view.${view.ID}.collapsed` : "aycorn.upcoming.collapsed",
    [],
  );

  const toggleCollapsed = (key: string) => {
    setCollapsedKeys((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const isCollapsed = (key: string) => collapsedKeys.includes(key);

  const settings: UpcomingViewSettings = {
    groupBy: view?.GroupBy ?? "timePlanned",
    granularity: view?.GroupOptions.granularity ?? "week",
  };

  const setGroupBy = (groupBy: GroupByKey) => {
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
    collapsedKeys,
    toggleCollapsed,
    isCollapsed,
    setGroupBy,
    setGranularity,
  };
}
