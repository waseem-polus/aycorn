import { TableView } from "@/components/project/tableView/TableView";
import { EditableProjectName } from "@/components/project/EditableProjectName";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TaskFilters } from "./TaskFilters";
import { KhanbanView } from "./khanbanView/KhanbanView";
import {
  IconCalendarMonth,
  IconCalendarWeek,
  IconLayoutBoard,
  IconList,
} from "@tabler/icons-react";
import { MonthView } from "./calendarViews/monthView";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/features/calendar/mocks";
import { WeekView } from "./calendarViews/weekView";
import { FullCalendarView } from "./fullCalendarView/FullCalendarView";

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
      <div className="flex justify-between align-top overflow-hidden">
        <EditableProjectName />
      </div>

      <div className="flex flex-col gap-4 h-full overflow-hidden">
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

                <TabsTrigger value="full-calendar">
                  <IconCalendarMonth />
                  Full Calendar
                </TabsTrigger>
              </TabsList>

              <TaskFilters setTaskDrawerOpen={setNewTaskOpen} />

              <TabsContent value="table" className="h-full overflow-hidden">
                <TableView />
              </TabsContent>
              <TabsContent value="khanban" className="h-full overflow-hidden">
                <KhanbanView />
              </TabsContent>
              <TabsContent value="month" className="h-full overflow-hidden">
                <MonthView />
              </TabsContent>
              <TabsContent value="week" className="h-full overflow-hidden">
                <WeekView />
              </TabsContent>
              <TabsContent
                value="full-calendar"
                className="h-full overflow-hidden"
              >
                <FullCalendarView />
              </TabsContent>
            </Tabs>
          </DndProvider>
        </CalendarProvider>
      </div>
    </>
  );
}
