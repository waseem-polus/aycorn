import { areIntervalsOverlapping, parseISO } from "date-fns";
import { getEventBlockStyle } from "@/features/calendar/helpers";
import {
  getTaskStartDate,
  getTaskEndDate,
} from "@/features/calendar/interfaces";
import type { Task } from "@/types/types";
import { EventBlock } from "@/features/calendar/views/weekView/event-block";

interface RenderGroupedEventsProps {
  groupedEvents: Task[][];
  day: Date;
}

export function RenderGroupedEvents({
  groupedEvents,
  day,
}: RenderGroupedEventsProps) {
  return groupedEvents.map((group, groupIndex) =>
    group.map((event) => {
      let style = getEventBlockStyle(
        event,
        day,
        groupIndex,
        groupedEvents.length,
      );
      const hasOverlap = groupedEvents.some(
        (otherGroup, otherIndex) =>
          otherIndex !== groupIndex &&
          otherGroup.some((otherEvent) =>
            areIntervalsOverlapping(
              {
                start: parseISO(getTaskStartDate(event)),
                end: parseISO(getTaskEndDate(event)),
              },
              {
                start: parseISO(getTaskStartDate(otherEvent)),
                end: parseISO(getTaskEndDate(otherEvent)),
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
