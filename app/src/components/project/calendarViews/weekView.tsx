import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { CalendarWeekView } from "@/features/calendar/views/weekAndDayView/calendar-week-view";
import { isSameDay, parseISO } from "date-fns";

export function WeekView() {
  const { events } = useCalendar();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  return (
    <div className="div flex gap-2 w-full h-full">
      <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={[]} />
    </div>
  );
}
