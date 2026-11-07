import { CalendarWeekView } from "@/features/calendar/views/weekView/calendar-week-view";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";
import { splitCalendarEvents } from "@/features/calendar/date-field";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense, useContext, useMemo } from "react";
import { WeekViewSkeleton } from "@/features/calendar/skeletons/week-view-skeleton";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function WeekView({
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
