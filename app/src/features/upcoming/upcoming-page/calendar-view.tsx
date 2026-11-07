import { Suspense, useMemo } from "react";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { CalendarWeekView } from "@/features/calendar/views/weekView/calendar-week-view";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import { MonthViewSkeleton } from "@/features/calendar/skeletons/month-view-skeleton";
import { WeekViewSkeleton } from "@/features/calendar/skeletons/week-view-skeleton";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";
import { splitCalendarEvents } from "@/features/calendar/date-field";
import type { TaskWithProject } from "@/types/types";

type Props = {
  tasks: TaskWithProject[];
  layout: "month" | "week";
};

/** /upcoming's month and week layouts, placing tasks by the view's date. */
export function UpcomingCalendarView({ tasks, layout }: Props) {
  const { dateField } = useCalendarHost();
  // Tasks without the view's date have no cell to live in. The list view
  // buckets them under "No date"; here they're simply absent.
  const { singleDayEvents, multiDayEvents } = useMemo(
    () => splitCalendarEvents(tasks, dateField),
    [tasks, dateField],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Own row, as on the project page — DateNavigator is a full-width bar. */}
      <DateNavigator view={layout} />

      <div className="flex h-full min-h-0 gap-2 overflow-hidden">
        {layout === "month" ? (
          <Suspense fallback={<MonthViewSkeleton />}>
            <CalendarMonthView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<WeekViewSkeleton />}>
            <CalendarWeekView
              singleDayEvents={singleDayEvents}
              multiDayEvents={multiDayEvents}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
