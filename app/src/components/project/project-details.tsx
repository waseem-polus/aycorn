import { ListView } from "@/components/project/views/listView/list-view";
import { ProjectContentHeader } from "@/components/project/project-details-content-header";
import { useContext, useEffect, useMemo, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { KanbanView } from "./views/kanbanView/kanban-view";
import { MonthView } from "./views/calendarViews/month-view";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { WeekView } from "./views/calendarViews/week-view";
import { useSharedSelection } from "@/hooks/useSelection";
import { BulkActionsToolbar } from "@/features/task/bulk-actions-toolbar";
import {
  CalendarDaysIcon,
  CalendarIcon,
  LayoutDashboardIcon,
  Rows3Icon,
} from "lucide-react";

export function ProjectDetails({
  view,
  setView,
  projectId,
}: {
  view: string;
  setView: (view: string) => void;
  projectId: number;
}) {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const {
    SetProject,
    SetWorkflow,
    SetStages,
    SetChecklists,
    SetTasks,
    Filter,
    Tasks,
  } = useContext(ProjectContext);
  const selection = useSharedSelection();
  const selectedTasks = useMemo(
    () => Tasks.filter((t) => selection.selectedIds.has(t.ID.toString())),
    [Tasks, selection.selectedIds],
  );
  const { isPending, data, isFetching, refetch } = useProjectDetailsQuery(
    projectId,
    Filter,
    !newTaskOpen,
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

  useEffect(() => {
    refetch();
  }, [refetch, Filter]);

  return (
    <div className="flex flex-col gap-4 grow min-h-0 overflow-visible">
      <ProjectContentHeader />

      <div className="flex grow flex-col gap-4 overflow-visible min-h-0">
        <CalendarProvider events={[]} users={[]} view="month">
          <DndProvider>
            <Tabs value={view} onValueChange={setView} className="h-full">
              <TabsList>
                <TabsTrigger value="table">
                  <Rows3Icon />
                  List
                </TabsTrigger>
                <TabsTrigger value="khanban">
                  <LayoutDashboardIcon />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="month">
                  <CalendarDaysIcon />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week">
                  <CalendarIcon />
                  Week
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="table"
                className="h-full overflow-visible min-h-0"
              >
                <ListView setTaskDrawerOpen={setNewTaskOpen} />
              </TabsContent>
              <TabsContent
                value="khanban"
                className="h-full overflow-visible min-h-0"
              >
                <KanbanView setTaskDrawerOpen={setNewTaskOpen} />
              </TabsContent>
              <TabsContent
                value="month"
                className="h-full overflow-visible min-h-0"
              >
                <MonthView setTaskDrawerOpen={setNewTaskOpen} />
              </TabsContent>
              <TabsContent
                value="week"
                className="h-full overflow-visible min-h-0"
              >
                <WeekView setTaskDrawerOpen={setNewTaskOpen} />
              </TabsContent>
            </Tabs>
          </DndProvider>
        </CalendarProvider>
      </div>

      <BulkActionsToolbar
        selectedTasks={selectedTasks}
        onClear={selection.clearSelection}
      />
    </div>
  );
}
