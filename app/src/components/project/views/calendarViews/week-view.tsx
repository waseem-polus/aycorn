import { CalendarWeekView } from "@/features/calendar/views/weekView/calendar-week-view";
import { isSameDay, parseISO } from "date-fns";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense, useContext } from "react";
import { WeekViewSkeleton } from "@/features/calendar/skeletons/week-view-skeleton";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function WeekView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks } = useContext(ProjectContext);

  const singleDayEvents = Tasks.filter((task) => {
    if (task.TimePlannedStart === null) {
      return false;
    }

    const startDate = parseISO(task.TimePlannedStart);
    const endDate = parseISO(task.TimePlannedEnd ?? task.TimePlannedStart);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = Tasks.filter((task) => {
    if (task.TimePlannedStart === null) {
      return false;
    }

    const startDate = parseISO(task.TimePlannedStart);
    const endDate = parseISO(task.TimePlannedEnd ?? task.TimePlannedStart);
    return !isSameDay(startDate, endDate);
  });

  return (
    <div className="flex flex-col gap-2">
      <CalendarViewHeader setTaskDrawerOpen={setTaskDrawerOpen} view="week" />

      <div className="div flex gap-2 w-full h-full">
        <Suspense fallback={<WeekViewSkeleton />}>
          <CalendarWeekView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        </Suspense>
      </div>
    </div>
  );
}
