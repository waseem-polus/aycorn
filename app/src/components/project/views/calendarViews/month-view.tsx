import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { isSameDay, parseISO } from "date-fns";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense } from "react";
import { MonthViewSkeleton } from "@/features/calendar/skeletons/month-view-skeleton";

export function MonthView({
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
