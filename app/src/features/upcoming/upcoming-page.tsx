import { useEffect, useMemo, useState } from "react";
import { CalendarDaysIcon, Rows3Icon } from "lucide-react";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpcomingTasksQuery } from "@/features/upcoming/queries/useUpcomingTasksQuery";
import { useTaskFacetsQuery } from "@/features/upcoming/queries/useTaskFacetsQuery";
import { useUpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import { applyClientFilters } from "@/features/upcoming/upcoming-grouping";
import { UpcomingFilterDrawer } from "@/features/upcoming/upcoming-filter-drawer";
import { UpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";
import { UpcomingBulkActionsToolbar } from "@/features/upcoming/upcoming-bulk-actions-toolbar";
import { UpcomingToolbar } from "@/features/upcoming/upcoming-page/toolbar";
import { GroupByDropdown } from "@/features/upcoming/upcoming-page/group-by-dropdown";
import { UpcomingListView } from "@/features/upcoming/upcoming-page/list-view";
import { UpcomingMonthView } from "@/features/upcoming/upcoming-page/month-view";
import { makeUpcomingTaskScope } from "@/features/upcoming/upcoming-page/upcoming-task-scope";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { CalendarHostProvider } from "@/features/calendar/contexts/calendar-host-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { useSharedSelection } from "@/hooks/useSelection";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import type { GroupingData } from "@/features/upcoming/upcoming-grouping";
import type { Stage } from "@/types/types";

type Props = {
  layout: string;
  setLayout: (layout: string) => void;
};

export function UpcomingPage({ layout, setLayout }: Props) {
  const filtersApi = useUpcomingFilters();
  const { filters, view } = filtersApi;

  const [filterOpen, setFilterOpen] = useState(false);

  const { data: tasks = [], isFetching } = useUpcomingTasksQuery(filters);
  const { data: facets = { assignees: [], checklists: [] } } =
    useTaskFacetsQuery();
  const { data: projects = [] } = useAllProjectsQuery();
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

  // The calendar views hand back a bare ChecklistTask, so the scope resolves the
  // owning project through this map rather than narrowing the type.
  const projectIdByTaskId = useMemo(
    () => Object.fromEntries(tasks.map((t) => [t.ID, t.ProjectID])),
    [tasks],
  );
  const TaskScope = useMemo(
    () => makeUpcomingTaskScope(projectIdByTaskId, projectById),
    [projectIdByTaskId, projectById],
  );

  return (
    <UpcomingFiltersContext.Provider value={filtersApi}>
      <Page>
        <PageHeader breadcrumb={["Upcoming"]} />
        <PageContent>
          <PageTitle
            title="Upcoming"
            description="Tasks across every project. Read, edit, and clear what's scheduled."
          />

          <CalendarProvider events={[]} users={[]} view="month">
            <CalendarHostProvider projectId={null} TaskScope={TaskScope}>
              <DndProvider>
                <Tabs
                  value={layout}
                  onValueChange={setLayout}
                  className="flex flex-col gap-4 flex-1 min-h-0"
                >
                  <TabsList>
                    <TabsTrigger value="list">
                      <Rows3Icon />
                      List
                    </TabsTrigger>
                    <TabsTrigger value="month">
                      <CalendarDaysIcon />
                      Month
                    </TabsTrigger>
                  </TabsList>

                  <UpcomingToolbar
                    isFetching={isFetching}
                    resultCount={searched.length}
                    onFilterOpen={() => setFilterOpen(true)}
                  >
                    {layout === "list" && (
                      <GroupByDropdown
                        groupBy={view.groupBy}
                        granularity={view.granularity}
                        onChange={filtersApi.setGroupBy}
                        onGranularityChange={filtersApi.setGranularity}
                      />
                    )}
                  </UpcomingToolbar>

                  <TabsContent
                    value="list"
                    className="flex flex-col flex-1 min-h-0"
                  >
                    <UpcomingListView
                      tasks={searched}
                      stageById={stageById}
                      projectById={projectById}
                      groupingData={groupingData}
                    />
                  </TabsContent>
                  <TabsContent
                    value="month"
                    className="flex flex-col flex-1 min-h-0"
                  >
                    <UpcomingMonthView tasks={searched} />
                  </TabsContent>
                </Tabs>
              </DndProvider>
            </CalendarHostProvider>
          </CalendarProvider>

          {/* Bulk actions toolbar — must be inside PageContent to access SelectionContext */}
          <UpcomingBulkActionsToolbar tasks={tasks} />
          <ClearSelectionOnLayoutChange layout={layout} />
        </PageContent>
      </Page>

      {/* Filter drawer */}
      <UpcomingFilterDrawer
        open={filterOpen}
        projects={projects}
        stages={allStages}
        workflows={workflows}
        taskTypes={taskTypes}
        taskTypeCategories={taskTypeCategories}
        facets={facets}
        onClose={() => setFilterOpen(false)}
      />
    </UpcomingFiltersContext.Provider>
  );
}

/**
 * Month badges aren't selectable, so a selection carried over from the list tab
 * would leave the bulk toolbar floating over a surface with nothing selected.
 * Lives in its own component because `useSharedSelection` needs the
 * `SelectionContext` that `PageContent` provides.
 */
function ClearSelectionOnLayoutChange({ layout }: { layout: string }) {
  const { clearSelection } = useSharedSelection();
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);
  return null;
}
