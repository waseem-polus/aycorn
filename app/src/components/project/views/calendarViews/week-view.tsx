import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { CalendarWeekView } from "@/features/calendar/views/weekAndDayView/calendar-week-view";
import { isSameDay, parseISO } from "date-fns";
import { CalendarViewHeader } from "./calendar-views-header";
import { Suspense } from "react";
import { WeekViewSkeleton } from "@/features/calendar/skeletons/week-view-skeleton";

export function WeekView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { events } = useCalendar();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  return (
    <div className="flex flex-col gap-2">
      <CalendarViewHeader setTaskDrawerOpen={setTaskDrawerOpen} view="month" />

      <div className="div flex gap-2 w-full h-full">
        <Suspense fallback={<WeekViewSkeleton />}>
          <CalendarWeekView
            singleDayEvents={singleDayEvents}
            multiDayEvents={[]}
          />
        </Suspense>
      </div>
    </div>
  );
}
