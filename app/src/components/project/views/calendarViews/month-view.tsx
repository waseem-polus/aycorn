import { useCalendar } from "@/features/calendar/contexts/calendar-context";
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
  const { events } = useCalendar();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <CalendarViewHeader setTaskDrawerOpen={setTaskDrawerOpen} view="month" />

      <div className="div flex gap-2 h-full min-h-0 overflow-hidden">
        <Suspense fallback={<MonthViewSkeleton />}>
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={[]}
          />
        </Suspense>
      </div>
    </div>
  );
}
