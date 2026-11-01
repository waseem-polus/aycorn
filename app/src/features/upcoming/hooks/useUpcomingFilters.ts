import { useLocalStorage } from "@/features/calendar/hooks";
import { useBoardFilter } from "@/features/saved-filters/hooks/useBoardFilter";

export type GroupByKey =
  | "timePlanned"
  | "timeCompleted"
  | "project"
  | "stage"
  | "priority"
  | "type"
  | "assignee"
  | "checklist";

export type Granularity = "day" | "week" | "month";

export type UpcomingViewSettings = {
  groupBy: GroupByKey;
  granularity: Granularity;
  showEmpty: boolean;
};

const UPCOMING_BOARD = { surface: "upcoming" } as const;

const DEFAULT_VIEW: UpcomingViewSettings = {
  groupBy: "timePlanned",
  granularity: "week",
  showEmpty: false,
};

/**
 * The shared task filters scoped to the upcoming page, plus the grouping and
 * collapse state that only this page has.
 */
export function useUpcomingFilters() {
  const filtersApi = useBoardFilter(UPCOMING_BOARD);
  const [view, setView] = useLocalStorage<UpcomingViewSettings>(
    "aycorn.upcoming.view",
    DEFAULT_VIEW,
  );
  const [collapsedKeys, setCollapsedKeys] = useLocalStorage<string[]>(
    "aycorn.upcoming.collapsed",
    [],
  );

  const toggleCollapsed = (key: string) => {
    setCollapsedKeys((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const isCollapsed = (key: string) => collapsedKeys.includes(key);

  const setGroupBy = (groupBy: GroupByKey) => {
    setView((prev: UpcomingViewSettings) => ({ ...prev, groupBy }));
  };

  const setGranularity = (granularity: Granularity) => {
    setView((prev: UpcomingViewSettings) => ({ ...prev, granularity }));
  };

  const setShowEmpty = (showEmpty: boolean) => {
    setView((prev: UpcomingViewSettings) => ({ ...prev, showEmpty }));
  };

  return {
    ...filtersApi,
    view,
    collapsedKeys,
    toggleCollapsed,
    isCollapsed,
    setGroupBy,
    setGranularity,
    setShowEmpty,
  };
}
