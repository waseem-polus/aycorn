import { areIntervalsOverlapping, parseISO } from "date-fns";
import { getEventBlockStyle } from "@/features/calendar/helpers";
import {
  getTaskStartDate,
  getTaskEndDate,
} from "@/features/calendar/interfaces";
import type { ChecklistTask } from "@/types/types";
import { EventBlock } from "@/features/calendar/views/weekView/event-block";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";

interface RenderGroupedEventsProps {
  groupedEvents: ChecklistTask[][];
  day: Date;
}

export function RenderGroupedEvents({
  groupedEvents,
  day,
}: RenderGroupedEventsProps) {
  const { dateField } = useCalendarHost();
  return groupedEvents.map((group, groupIndex) =>
    group.map((event) => {
      let style = getEventBlockStyle(
        event,
        day,
        groupIndex,
        groupedEvents.length,
        dateField,
      );
      const hasOverlap = groupedEvents.some(
        (otherGroup, otherIndex) =>
          otherIndex !== groupIndex &&
          otherGroup.some((otherEvent) =>
            areIntervalsOverlapping(
              {
                start: parseISO(getTaskStartDate(event, dateField)),
                end: parseISO(getTaskEndDate(event, dateField)),
              },
              {
                start: parseISO(getTaskStartDate(otherEvent, dateField)),
                end: parseISO(getTaskEndDate(otherEvent, dateField)),
              },
            ),
          ),
      );

      if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

      return (
        <div key={event.ID} className="absolute p-1" style={style}>
          <EventBlock event={event} />
        </div>
      );
    }),
  );
}
