import { ListView } from "@/components/project/views/listView/list-view";
import { EditableProjectName } from "@/components/project/editable-project-name";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { KanbanView } from "./views/kanbanView/kanban-view";
import {
  IconCalendarMonth,
  IconCalendarWeek,
  IconLayoutBoard,
  IconList,
} from "@tabler/icons-react";
import { MonthView } from "./views/calendarViews/month-view";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/features/calendar/mocks";
import { WeekView } from "./views/calendarViews/week-view";

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
  const { SetProject, SetChecklists, SetTasks, Filter } =
    useContext(ProjectContext);
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
    }
  }, [data, isFetching, isPending, SetProject, SetChecklists, SetTasks]);

  useEffect(() => {
    refetch();
  }, [refetch, Filter]);

  return (
    <>
      <div className="flex justify-between align-top overflow-visible">
        <EditableProjectName />
      </div>

      <div className="flex grow flex-col gap-4 overflow-visible min-h-0">
        <CalendarProvider
          events={CALENDAR_ITEMS_MOCK}
          users={USERS_MOCK}
          view="month"
        >
          <DndProvider>
            <Tabs value={view} onValueChange={setView} className="h-full">
              <TabsList>
                <TabsTrigger value="table">
                  <IconList />
                  List
                </TabsTrigger>
                <TabsTrigger value="khanban">
                  <IconLayoutBoard />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="month">
                  <IconCalendarWeek />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week">
                  <IconCalendarMonth />
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
    </>
  );
}
