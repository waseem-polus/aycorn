import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { isSameDay, parseISO } from "date-fns";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense } from "react";
import { MonthViewSkeleton } from "@/features/calendar/skeletons/month-view-skeleton";
import type { IEvent } from "@/features/calendar/interfaces";
import type { TEventColor } from "@/features/calendar/types";
import type { Type } from "@/types/types";

export function MonthView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks } = useContext(ProjectContext);

  const events: IEvent[] = Tasks.map((task) => ({
    id: task.ID,
    startDate: task.TimePlannedStart || task.TimeCreated,
    endDate: task.TimePlannedEnd || task.TimePlannedStart || task.TimeCreated,
    title: task.Name,
    color: getColorForTaskType(task.Type),
    description: task.ChecklistName,
    user: { id: task.Assignee, name: task.Assignee, picturePath: null },
  }));

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return !isSameDay(startDate, endDate);
  });

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <CalendarViewHeader setTaskDrawerOpen={setTaskDrawerOpen} view="month" />

      <div className="div flex gap-2 h-full min-h-0 overflow-hidden">
        <Suspense fallback={<MonthViewSkeleton />}>
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
            setTaskDrawerOpen={setTaskDrawerOpen}
          />
        </Suspense>
      </div>
    </div>
  );
}

function getColorForTaskType(priority: Type): TEventColor {
  switch (priority) {
    case "Dev":
      return "green";
    case "Reminder":
      return "orange";
    case "Test":
      return "blue";
  }
}
