import { Suspense, useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import { MonthViewSkeleton } from "@/features/calendar/skeletons/month-view-skeleton";
import type { TaskWithProject } from "@/types/types";

type Props = {
  tasks: TaskWithProject[];
};

export function UpcomingMonthView({ tasks }: Props) {
  // Tasks without a planned start have no cell to live in. The list view
  // buckets them under "No date"; here they're simply absent.
  const { singleDayEvents, multiDayEvents } = useMemo(() => {
    const single: TaskWithProject[] = [];
    const multi: TaskWithProject[] = [];
    for (const task of tasks) {
      if (task.TimePlannedStart === null) continue;
      const start = parseISO(task.TimePlannedStart);
      const end = parseISO(task.TimePlannedEnd ?? task.TimePlannedStart);
      (isSameDay(start, end) ? single : multi).push(task);
    }
    return { singleDayEvents: single, multiDayEvents: multi };
  }, [tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Own row, as on the project page — DateNavigator is a full-width bar. */}
      <DateNavigator view="month" />

      <div className="flex h-full min-h-0 gap-2 overflow-hidden">
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
