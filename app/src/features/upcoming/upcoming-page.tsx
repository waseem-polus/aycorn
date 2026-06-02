import { useMemo, useState } from "react";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { useUpcomingTasksQuery } from "@/features/upcoming/queries/useUpcomingTasksQuery";
import {
  useUpcomingFilters,
  EMPTY_FILTERS,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import {
  buildGroups,
  applyClientFilters,
} from "@/features/upcoming/upcoming-grouping";
import { UpcomingFilterDrawer } from "@/features/upcoming/upcoming-filter-drawer";
import { UpcomingBulkActionsToolbar } from "@/features/upcoming/upcoming-bulk-actions-toolbar";
import { UpcomingToolbar } from "@/features/upcoming/upcoming-page/toolbar";
import { UpcomingTaskList } from "@/features/upcoming/upcoming-page/task-list";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import type { GroupingData } from "@/features/upcoming/upcoming-grouping";
import type { Stage, Project } from "@/types/types";

export function UpcomingPage() {
  const {
    filters,
    view,
    toggleFilter,
    clearFilterDim,
    setSearch,
    setDateFilter,
    setHasTimeFilter,
    resetAll,
    activeFilterCount,
    toggleCollapsed,
    isCollapsed,
    setGroupBy,
    setGranularity,
    setShowEmpty,
  } = useUpcomingFilters();

  const [filterOpen, setFilterOpen] = useState(false);

  const { data: tasks = [], isFetching } = useUpcomingTasksQuery(filters);
  const { data: allTasks = [] } = useUpcomingTasksQuery(EMPTY_FILTERS);
  const { data: projects = [] } = useAllProjectsQuery() as { data: Project[] };
  const { data: workflows = [] } = useAllWorkflowsQuery();
  const { data: allStagesData = [] } = useAllStagesQuery();
  const { data: taskTypes = [] } = useTaskTypesQuery();
  const { data: taskTypeCategories = [] } = useTaskTypeCategoriesQuery();

  const projectById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.ID, p])),
    [projects],
  );
  const stageById = useMemo<Record<number, Stage>>(
    () => Object.fromEntries(allStagesData.map((s) => [s.ID, s])),
    [allStagesData],
  );
  const allStages = allStagesData;
  const groupingData: GroupingData = useMemo(
    () => ({ projectById, stageById }),
    [projectById, stageById],
  );

  const searched = useMemo(
    () => applyClientFilters(tasks, filters.search),
    [tasks, filters.search],
  );

  const groups = useMemo(
    () =>
      buildGroups(searched, {
        groupBy: view.groupBy,
        granularity: view.granularity,
        today: new Date(),
        showEmpty: view.showEmpty,
        data: groupingData,
      }),
    [searched, view.groupBy, view.granularity, view.showEmpty, groupingData],
  );

  const filterCount = activeFilterCount();

  return (
    <>
      <Page>
        <PageHeader breadcrumb={["Upcoming"]} />
        <PageContent>
          <PageTitle
            title="Upcoming"
            description="Tasks across every project. Read, edit, and clear what's scheduled."
          />
          <UpcomingToolbar
            search={filters.search}
            isFetching={isFetching}
            resultCount={searched.length}
            filterCount={filterCount}
            groupBy={view.groupBy}
            granularity={view.granularity}
            onSearchChange={setSearch}
            onFilterOpen={() => setFilterOpen(true)}
            onGroupByChange={setGroupBy}
            onGranularityChange={setGranularity}
          />

          <UpcomingTaskList
            groups={groups}
            filterCount={filterCount}
            stageById={stageById}
            projectById={projectById}
            isCollapsed={isCollapsed}
            onToggleCollapsed={toggleCollapsed}
            onResetFilters={resetAll}
          />

          {/* Bulk actions toolbar — must be inside PageContent to access SelectionContext */}
          <UpcomingBulkActionsToolbar tasks={tasks} />
        </PageContent>
      </Page>

      {/* Filter drawer */}
      <UpcomingFilterDrawer
        open={filterOpen}
        filters={filters}
        showEmpty={view.showEmpty}
        projects={projects}
        stages={allStages}
        workflows={workflows}
        taskTypes={taskTypes}
        taskTypeCategories={taskTypeCategories}
        allTasks={allTasks}
        onToggle={toggleFilter}
        onClearDim={clearFilterDim}
        onSetDate={setDateFilter}
        onSetHasTime={setHasTimeFilter}
        onToggleEmpty={setShowEmpty}
        onReset={resetAll}
        onClose={() => setFilterOpen(false)}
        activeCount={filterCount}
      />
    </>
  );
}
