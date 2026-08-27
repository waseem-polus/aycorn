import { useLocalStorage } from "@/features/calendar/hooks";

/**
 * How a date dimension is filtered. "all" ignores the dimension entirely,
 * "none" keeps only tasks missing that date, and "with" keeps only tasks that
 * have it — narrowed further by a range when one is picked.
 */
export type DateFilterMode = "all" | "none" | "with";

export type UpcomingFilters = {
  search: string;
  project: number[];
  stage: number[];
  type: number[];
  priority: string[];
  assignee: string[];
  checklist: number[];
  dates: {
    plannedMode?: DateFilterMode;
    completedMode?: DateFilterMode;
    plannedFrom?: string;
    plannedTo?: string;
    plannedFromHasTime?: boolean;
    plannedToHasTime?: boolean;
    completedFrom?: string;
    completedTo?: string;
    completedFromHasTime?: boolean;
    completedToHasTime?: boolean;
  };
};

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

export const EMPTY_FILTERS: UpcomingFilters = {
  search: "",
  project: [],
  stage: [],
  type: [],
  priority: [],
  assignee: [],
  checklist: [],
  dates: {},
};

const DEFAULT_VIEW: UpcomingViewSettings = {
  groupBy: "timePlanned",
  granularity: "week",
  showEmpty: false,
};

export type DateModeKey = "plannedMode" | "completedMode";

const FILTER_DIMS = ["project", "stage", "type", "priority", "assignee", "checklist"] as const;
export type FilterDim = (typeof FILTER_DIMS)[number];

export function useUpcomingFilters() {
  const [filters, setFilters] = useLocalStorage<UpcomingFilters>(
    "aycorn.upcoming.filters",
    EMPTY_FILTERS,
  );
  const [view, setView] = useLocalStorage<UpcomingViewSettings>(
    "aycorn.upcoming.view",
    DEFAULT_VIEW,
  );
  const [collapsedKeys, setCollapsedKeys] = useLocalStorage<string[]>(
    "aycorn.upcoming.collapsed",
    [],
  );

  const toggleFilter = (dim: FilterDim, key: string | number) => {
    setFilters((prev: UpcomingFilters) => {
      const cur = (prev[dim] as (string | number)[]) ?? [];
      const next = cur.includes(key as never)
        ? cur.filter((k) => k !== key)
        : [...cur, key];
      return { ...prev, [dim]: next };
    });
  };

  const clearFilterDim = (dim: FilterDim) => {
    setFilters((prev: UpcomingFilters) => ({ ...prev, [dim]: [] }));
  };

  const setSearch = (search: string) => {
    setFilters((prev: UpcomingFilters) => ({ ...prev, search }));
  };

  const setDateFilter = (key: string, value: string) => {
    setFilters((prev: UpcomingFilters) => {
      if (value) return { ...prev, dates: { ...prev.dates, [key]: value } };
      const d = { ...prev.dates };
      delete d[key as keyof typeof d];
      delete d[(key + "HasTime") as keyof typeof d];
      return { ...prev, dates: d };
    });
  };

  const setHasTimeFilter = (key: string, value: boolean) => {
    setFilters((prev: UpcomingFilters) => {
      if (!value) {
        const d = { ...prev.dates };
        delete d[key as keyof typeof d];
        return { ...prev, dates: d };
      }
      return { ...prev, dates: { ...prev.dates, [key]: value } };
    });
  };

  /**
   * Leaving "with" mode discards the range that was only meaningful there, so
   * returning to it starts from a clean picker. Mode and range are cleared in
   * one functional update — two `setFilters` calls in the same render would
   * overwrite each other.
   */
  const setDateMode = (
    modeKey: DateModeKey,
    mode: DateFilterMode,
    fromKey: string,
    toKey: string,
  ) => {
    setFilters((prev: UpcomingFilters) => {
      const dates = { ...prev.dates, [modeKey]: mode };
      if (mode !== "with") {
        for (const key of [fromKey, toKey, fromKey + "HasTime", toKey + "HasTime"]) {
          delete dates[key as keyof typeof dates];
        }
      }
      return { ...prev, dates };
    });
  };

  const resetAll = () => {
    setFilters(EMPTY_FILTERS);
  };

  const activeFilterCount = (): number => {
    let n = FILTER_DIMS.reduce(
      (acc, dim) => acc + ((filters[dim] as unknown[])?.length ?? 0),
      0,
    );
    const { plannedMode, completedMode } = filters.dates ?? {};
    if ((plannedMode ?? "all") !== "all") n++;
    if ((completedMode ?? "all") !== "all") n++;
    return n;
  };

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
    filters,
    view,
    collapsedKeys,
    toggleFilter,
    clearFilterDim,
    setSearch,
    setDateFilter,
    setHasTimeFilter,
    setDateMode,
    resetAll,
    activeFilterCount,
    toggleCollapsed,
    isCollapsed,
    setGroupBy,
    setGranularity,
    setShowEmpty,
    EMPTY_FILTERS,
  };
}
