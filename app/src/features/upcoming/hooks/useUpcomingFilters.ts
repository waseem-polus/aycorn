import { useLocalStorage } from "@/features/calendar/hooks";

export type UpcomingFilters = {
  search: string;
  project: number[];
  stage: number[];
  type: number[];
  priority: string[];
  assignee: string[];
  checklist: number[];
  dates: {
    plannedFrom?: string;
    plannedTo?: string;
    completedFrom?: string;
    completedTo?: string;
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

const EMPTY_FILTERS: UpcomingFilters = {
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

const FILTER_DIMS = ["project", "stage", "type", "priority", "assignee", "checklist"] as const;
type FilterDim = (typeof FILTER_DIMS)[number];

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
    setFilters((prev: UpcomingFilters) => ({
      ...prev,
      dates: value ? { ...prev.dates, [key]: value } : (() => { const d = { ...prev.dates }; delete d[key as keyof typeof d]; return d; })(),
    }));
  };

  const resetAll = () => {
    setFilters(EMPTY_FILTERS);
  };

  const activeFilterCount = (): number => {
    let n = FILTER_DIMS.reduce(
      (acc, dim) => acc + ((filters[dim] as unknown[])?.length ?? 0),
      0,
    );
    const { plannedFrom, plannedTo, completedFrom, completedTo } = filters.dates ?? {};
    if (plannedFrom || plannedTo) n++;
    if (completedFrom || completedTo) n++;
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
