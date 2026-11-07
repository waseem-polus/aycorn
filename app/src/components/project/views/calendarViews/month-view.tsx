import { useContext, useMemo } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";
import { splitCalendarEvents } from "@/features/calendar/date-field";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense } from "react";
import { MonthViewSkeleton } from "@/features/calendar/skeletons/month-view-skeleton";

export function MonthView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks } = useContext(ProjectContext);
  const { dateField } = useCalendarHost();
  const { singleDayEvents, multiDayEvents } = useMemo(
    () => splitCalendarEvents(Tasks, dateField),
    [Tasks, dateField],
  );

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <CalendarViewHeader setTaskDrawerOpen={setTaskDrawerOpen} view="month" />

      <div className="div flex gap-2 h-full min-h-0 overflow-hidden">
        <Suspense fallback={<MonthViewSkeleton />}>
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        </Suspense>
      </div>
    </div>
  );
}
