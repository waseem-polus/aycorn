import { ProjectContentHeader } from "@/components/project/project-details-content-header";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useBoardFilter } from "@/features/saved-filters/hooks/useBoardFilter";
import { ProjectFiltersContext } from "@/features/project-filters/project-filters-context";
import { useProjectConditionSources } from "@/features/project-filters/hooks/useProjectConditionSources";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { CalendarHostProvider } from "@/features/calendar/contexts/calendar-host-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { NewTaskEditorDrawer } from "./views/calendarViews/new-task-editor-drawer";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { useSharedSelection } from "@/hooks/useSelection";
import { BulkActionsToolbar } from "@/features/task/bulk-actions-toolbar";
import { useBoardViews } from "@/features/views/hooks/useBoardViews";
import { useViewSourceWire } from "@/features/views/hooks/useViewSourceWire";
import { ViewTabs } from "@/features/views/view-tabs";
import { ViewLayout } from "@/components/project/project-details/view-layout";

export function ProjectDetails({
  viewId,
  setViewId,
  projectId,
}: {
  /** The view in the URL; any other value shows the project's first view. */
  viewId: number | undefined;
  setViewId: (viewId: number) => void;
  projectId: number;
}) {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const { SetProject, SetWorkflow, SetStages, SetChecklists, SetTasks, Tasks } =
    useContext(ProjectContext);
  const board = useMemo(() => ({ surface: "project" as const, projectId }), [projectId]);
  const views = useBoardViews(board, viewId);
  const view = views.active;
  // Each view remembers its own ad-hoc drawer filters; quick filters are the
  // board's, so their toggles carry across views.
  const filtersApi = useBoardFilter(
    board,
    view ? `project.${projectId}.view.${view.ID}` : `project.${projectId}`,
  );
  const sourceWire = useViewSourceWire(view);
  const conditions = useMemo(
    () => [...sourceWire, ...filtersApi.conditionWires],
    [sourceWire, filtersApi.conditionWires],
  );
  const conditionSources = useProjectConditionSources();
  const selection = useSharedSelection();
  const selectedTasks = useMemo(
    () => Tasks.filter((t) => selection.selectedIds.has(t.ID.toString())),
    [Tasks, selection.selectedIds],
  );
  const { isPending, data, isFetching } = useProjectDetailsQuery(
    projectId,
    filtersApi.filters,
    !newTaskOpen && filtersApi.filtersReady && !views.isPending,
    conditions,
  );

  useEffect(() => {
    if (data && !isPending && !isFetching) {
      SetTasks(data.Tasks);
      SetChecklists(data.Checklists);
      SetProject(data.Project);
      SetWorkflow(data.Workflow);
      SetStages(data.Stages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFetching, isPending, projectId]);

  const renderDayCreate = useCallback(
    (date: Date) => (
      <TaskProvider>
        <NewTaskEditorDrawer date={date} setTaskDrawerOpen={setNewTaskOpen} />
      </TaskProvider>
    ),
    [],
  );

  return (
    <ProjectFiltersContext.Provider value={filtersApi}>
      <div className="flex flex-col gap-4 grow min-h-0 overflow-visible">
        <ProjectContentHeader />

        <div className="flex grow flex-col gap-4 overflow-visible min-h-0">
          <CalendarProvider events={[]} users={[]} view="month">
            <CalendarHostProvider
              projectId={projectId}
              renderDayCreate={renderDayCreate}
            >
              <DndProvider>
                <div className="flex h-full min-h-0 flex-col gap-2">
                  <ViewTabs
                    api={views}
                    selectedId={view?.ID ?? null}
                    onSelect={setViewId}
                    sources={conditionSources}
                  />
                  {view && (
                    <div className="h-full min-h-0 overflow-visible">
                      <ViewLayout view={view} setTaskDrawerOpen={setNewTaskOpen} />
                    </div>
                  )}
                </div>
              </DndProvider>
            </CalendarHostProvider>
          </CalendarProvider>
        </div>

        <BulkActionsToolbar
          selectedTasks={selectedTasks}
          onClear={selection.clearSelection}
        />
      </div>
    </ProjectFiltersContext.Provider>
  );
}
