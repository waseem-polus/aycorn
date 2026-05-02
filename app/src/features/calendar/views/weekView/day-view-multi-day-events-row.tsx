import {
  differenceInDays,
  endOfDay,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  getTaskStartDate,
  getTaskEndDate,
} from "@/features/calendar/interfaces";
import type { Task } from "@/types/types";
import { MonthEventBadge } from "@/features/calendar/views/monthView";

interface IProps {
  selectedDate: Date;
  multiDayEvents: Task[];
}

export function DayViewMultiDayEventsRow({
  selectedDate,
  multiDayEvents,
}: IProps) {
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const multiDayEventsInDay = multiDayEvents
    .filter((event) => {
      const eventStart = parseISO(getTaskStartDate(event));
      const eventEnd = parseISO(getTaskEndDate(event));

      return (
        isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
        (eventStart <= dayStart && eventEnd >= dayEnd)
      );
    })
    .sort((a, b) => {
      const durationA = differenceInDays(
        parseISO(getTaskEndDate(a)),
        parseISO(getTaskStartDate(a)),
      );
      const durationB = differenceInDays(
        parseISO(getTaskEndDate(b)),
        parseISO(getTaskStartDate(b)),
      );
      return durationB - durationA;
    });

  if (multiDayEventsInDay.length === 0) return null;

  return (
    <div className="flex border-b">
      <div className="w-18"></div>
      <div className="flex flex-1 flex-col gap-1 border-l py-1">
        {multiDayEventsInDay.map((event) => {
          const eventStart = startOfDay(parseISO(getTaskStartDate(event)));
          const eventEnd = startOfDay(parseISO(getTaskEndDate(event)));
          const currentDate = startOfDay(selectedDate);

          const eventTotalDays = differenceInDays(eventEnd, eventStart) + 1;
          const eventCurrentDay = differenceInDays(currentDate, eventStart) + 1;

          return (
            <MonthEventBadge
              key={event.ID}
              task={event}
              cellDate={selectedDate}
              eventCurrentDay={eventCurrentDay}
              eventTotalDays={eventTotalDays}
            />
          );
        })}
      </div>
    </div>
  );
}
