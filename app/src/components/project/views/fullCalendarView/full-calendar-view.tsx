import { CalendarSkeleton } from "@/features/calendar/skeletons/calendar-skeleton";
import { Calendar } from "@/features/calendar/calendar";
import { Suspense } from "react";

export function FullCalendarView() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <Calendar />
    </Suspense>
  );
}
