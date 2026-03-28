import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { CalendarMonthView } from "@/features/calendar/views/monthView";
import { isSameDay, parseISO } from "date-fns";

export function MonthView() {
  const { events } = useCalendar();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  return (
    <div className="div flex gap-2 h-full">
      <CalendarMonthView
        singleDayEvents={singleDayEvents}
        multiDayEvents={[]}
      />
    </div>
  );
}
