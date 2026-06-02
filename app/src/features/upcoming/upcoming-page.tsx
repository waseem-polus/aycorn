import { useMemo, useState } from "react";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { Button } from "@/components/ui/button";
import { CalendarClock, FilterIcon, Search } from "lucide-react";
import { useUpcomingTasksQuery } from "@/features/upcoming/queries/useUpcomingTasksQuery";
import {
  useUpcomingFilters,
  EMPTY_FILTERS,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import {
  buildGroups,
  applyClientFilters,
} from "@/features/upcoming/upcoming-grouping";
import { UpcomingGroupHeader } from "@/features/upcoming/upcoming-group-header";
import { UpcomingTaskRow } from "@/features/upcoming/upcoming-task-row";
import { UpcomingFilterDrawer } from "@/features/upcoming/upcoming-filter-drawer";
import { GroupByDropdown } from "@/features/upcoming/upcoming-page/group-by-dropdown";
import { UpcomingBulkActionsToolbar } from "@/features/upcoming/upcoming-bulk-actions-toolbar";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import type { GroupingData } from "@/features/upcoming/upcoming-grouping";
import type { Stage, Project } from "@/types/types";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";

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
          {/* Toolbar */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex gap-2 flex-1">
              <InputGroup className="flex flex-1">
                <InputGroupAddon>
                  <Search className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search tasks…"
                  value={filters.search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  {isFetching
                    ? "…"
                    : `${searched.length} ${searched.length === 1 ? "task" : "tasks"}`}
                </InputGroupAddon>
              </InputGroup>

              <Button
                variant="outline"
                size={filterCount > 0 ? "default" : "icon"}
                onClick={() => setFilterOpen(true)}
                className="gap-1.5"
              >
                <FilterIcon />
                {filterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </div>
            <div className="flex gap-2 justify-end sm:justify-start">
              <GroupByDropdown
                groupBy={view.groupBy}
                granularity={view.granularity}
                onChange={setGroupBy}
                onGranularityChange={setGranularity}
              />
            </div>
          </div>

          {/* Task list */}
          {groups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground">
              <CalendarClock className="size-8" />
              <div className="text-center">
                <p className="font-medium">No tasks match these filters</p>
                <p className="text-sm">
                  Adjust or reset the filters to see upcoming work.
                </p>
              </div>
              {filterCount > 0 && (
                <Button variant="outline" size="sm" onClick={resetAll}>
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 rounded-lg border border-border overflow-y-auto">
              {groups.map((group) => {
                const collapsed = isCollapsed(group.key);
                return (
                  <div key={group.key}>
                    <UpcomingGroupHeader
                      group={group}
                      collapsed={collapsed}
                      onToggle={() => toggleCollapsed(group.key)}
                    />
                    {!collapsed && (
                      <div>
                        {group.tasks.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            No tasks
                          </div>
                        ) : (
                          group.tasks.map((task) => (
                            <UpcomingTaskRow
                              key={task.ID}
                              task={task}
                              stageById={stageById}
                              project={projectById[task.ProjectID]}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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
