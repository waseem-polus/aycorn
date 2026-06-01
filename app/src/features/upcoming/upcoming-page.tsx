import { useMemo, useState } from "react";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarClock,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useUpcomingTasksQuery } from "@/features/upcoming/queries/useUpcomingTasksQuery";
import { useUpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import { useUpcomingBulkMutation } from "@/features/upcoming/queries/useUpcomingBulkMutation";
import {
  buildGroups,
  applyClientFilters,
} from "@/features/upcoming/upcoming-grouping";
import { UpcomingGroupHeader } from "@/features/upcoming/upcoming-group-header";
import { UpcomingTaskRow } from "@/features/upcoming/upcoming-task-row";
import { UpcomingFilterDrawer } from "@/features/upcoming/upcoming-filter-drawer";
import { GroupByDropdown } from "@/features/upcoming/upcoming-page/group-by-dropdown";
import { GranularitySegmented } from "@/features/upcoming/upcoming-page/granularity-segmented";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import type { GroupingData } from "@/features/upcoming/upcoming-grouping";
import type { Stage, Project, Task, TaskWithProject } from "@/types/types";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";

function sharedValue<K extends keyof Task>(
  tasks: TaskWithProject[],
  key: K,
): Task[K] | undefined {
  if (tasks.length === 0) return undefined;
  const first = tasks[0][key];
  return tasks.every((t) => t[key] === first) ? first : undefined;
}

export function UpcomingPage() {
  const {
    filters,
    view,
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
  } = useUpcomingFilters();

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set<number>());

  const { data: tasks = [], isFetching } = useUpcomingTasksQuery(filters);
  const { data: projects = [] } = useAllProjectsQuery() as { data: Project[] };
  const { data: workflows = [] } = useAllWorkflowsQuery();
  const { data: taskTypes = [] } = useTaskTypesQuery();
  const { data: taskTypeCategories = [] } = useTaskTypeCategoriesQuery();
  const { bulkUpdate, bulkDelete } = useUpcomingBulkMutation();

  const projectById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.ID, p])),
    [projects],
  );
  const stageById = useMemo<Record<number, Stage>>(
    () =>
      Object.fromEntries(
        workflows.flatMap((w) => w.Stages.map((s) => [s.ID, s])),
      ),
    [workflows],
  );
  const allStages = useMemo<Stage[]>(
    () => workflows.flatMap((w) => w.Stages),
    [workflows],
  );
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

  const selectedTasks = useMemo(
    () => tasks.filter((t) => selectedIds.has(t.ID)),
    [tasks, selectedIds],
  );

  const filterCount = activeFilterCount();
  const isTimeGroup =
    view.groupBy === "timePlanned" || view.groupBy === "timeCompleted";

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    bulkDelete.mutate([...selectedIds], {
      onSuccess: () => clearSelection(),
    });
  };

  const handleBulkUpdate = (changes: Partial<Task>) => {
    bulkUpdate.mutate(
      { ids: [...selectedIds], changes },
      {
        onSuccess: (result) => {
          if (result.success > 0)
            toast(
              `Updated ${result.success} ${result.success === 1 ? "task" : "tasks"}.`,
            );
          clearSelection();
        },
      },
    );
  };

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
          <div className="flex items-center gap-2 flex-wrap">
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
              <SlidersHorizontal />
              {filterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filterCount}
                </Badge>
              )}
            </Button>

            {isTimeGroup && (
              <GranularitySegmented
                value={view.granularity}
                onChange={setGranularity}
              />
            )}
            <GroupByDropdown groupBy={view.groupBy} onChange={setGroupBy} />
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
                              selected={selectedIds.has(task.ID)}
                              onToggleSelect={toggleSelect}
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
        allTasks={tasks}
        onToggle={toggleFilter}
        onClearDim={clearFilterDim}
        onSetDate={setDateFilter}
        onToggleEmpty={setShowEmpty}
        onReset={resetAll}
        onClose={() => setFilterOpen(false)}
        activeCount={filterCount}
      />

      {/* Bulk actions toolbar */}
      <BulkActionsToolbarBase
        count={selectedIds.size}
        onClear={clearSelection}
        delete={{
          title: `Delete ${selectedIds.size} ${selectedIds.size === 1 ? "task" : "tasks"}?`,
          description: "This cannot be undone.",
          onConfirm: handleBulkDelete,
          busy: bulkDelete.isPending,
        }}
      >
        <div className="w-32">
          <SelectTaskPriority
            value={sharedValue(selectedTasks, "Priority")}
            onValueChange={(v) => handleBulkUpdate({ Priority: v })}
            placeholder={
              sharedValue(selectedTasks, "Priority") === undefined
                ? "Mixed"
                : "Priority"
            }
          />
        </div>
        <div className="w-80">
          <DateRangePicker
            mode="datetime"
            from={sharedValue(selectedTasks, "TimePlannedStart") ?? null}
            to={sharedValue(selectedTasks, "TimePlannedEnd") ?? null}
            hasFromTime={
              sharedValue(selectedTasks, "HasTimePlannedStart") ?? false
            }
            hasToTime={sharedValue(selectedTasks, "HasTimePlannedEnd") ?? false}
            onRangeChange={(s, e, hasFrom, hasTo) =>
              handleBulkUpdate({
                TimePlannedStart: s,
                TimePlannedEnd: e,
                HasTimePlannedStart: hasFrom,
                HasTimePlannedEnd: hasTo,
              })
            }
            placeholder={
              sharedValue(selectedTasks, "TimePlannedStart") === undefined
                ? "Mixed"
                : "Select a date"
            }
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="More properties">
              <MoreHorizontal />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 flex flex-col gap-3"
            align="start"
            sideOffset={8}
          >
            <TaskAssignee
              value={sharedValue(selectedTasks, "Assignee") ?? ""}
              onValueChange={(v) => handleBulkUpdate({ Assignee: v })}
              placeholder={
                sharedValue(selectedTasks, "Assignee") === undefined
                  ? "Mixed"
                  : "Assignee"
              }
            />
          </PopoverContent>
        </Popover>
      </BulkActionsToolbarBase>
    </>
  );
}
