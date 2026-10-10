import { isToday, startOfDay, isSunday, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";

import { cn } from "@/lib/utils";
import { transition } from "@/features/calendar/animations";
import { EventListDialog } from "@/features/calendar/dialogs/events-list-dialog";
import { DroppableArea } from "@/features/calendar/dragAndDrop/droppable-area";
import { getMonthCellEvents } from "@/features/calendar/helpers";
import { useMediaQuery } from "@/features/calendar/hooks";
import type { ICalendarCell } from "@/features/calendar/interfaces";
import { getTaskStartDate, getTaskColor } from "@/features/calendar/interfaces";
import type { ChecklistTask } from "@/types/types";
import {
  EventBullet,
  MonthEventBadge,
} from "@/features/calendar/views/monthView";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";

interface IProps {
  cell: ICalendarCell;
  events: ChecklistTask[];
  eventPositions: Record<string, number>;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { renderDayCreate } = useCalendarHost();

  // Memoize cellEvents and currentCellMonth for performance
  const { cellEvents, currentCellMonth } = useMemo(() => {
    const cellEvents = getMonthCellEvents(date, events, eventPositions);
    const currentCellMonth = startOfDay(
      new Date(date.getFullYear(), date.getMonth(), 1),
    );
    return { cellEvents, currentCellMonth };
  }, [date, events, eventPositions]);

  // Memoize event rendering for each position with animation
  const renderEventAtPosition = useCallback(
    (position: number) => {
      const event = cellEvents.find((e) => e.position === position);
      if (!event) {
        return (
          <motion.div
            key={`empty-${position}`}
            className="lg:flex-1"
            initial={false}
            animate={false}
          />
        );
      }
      const showBullet = isSameMonth(
        new Date(getTaskStartDate(event)),
        currentCellMonth,
      );

      return (
        <motion.div
          key={`event-${event.ID}-${position}`}
          className="lg:flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: position * 0.1, ...transition }}
        >
          {showBullet && (
            <EventBullet className="lg:hidden" color={getTaskColor(event)} />
          )}
          <MonthEventBadge
            className="hidden lg:flex"
            task={event}
            cellDate={startOfDay(date)}
          />
        </motion.div>
      );
    },
    [cellEvents, currentCellMonth, date],
  );

  const showMoreCount = cellEvents.length - MAX_VISIBLE_EVENTS;

  const showMobileMore = isMobile && currentMonth && showMoreCount > 0;
  const showDesktopMore = !isMobile && currentMonth && showMoreCount > 0;

  const cellContent = useMemo(
    () => (
      <motion.div
        className={cn(
          "flex h-full lg:min-h-40 flex-col gap-1 border-l border-b group",
          isSunday(date) && "border-l-0",
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <DroppableArea date={date} className="w-full h-full py-2">
          <motion.div className="flex px-1 justify-between align-middle w-full lg:px-2">
            <motion.span
              className={cn(
                "h-6 text-xs font-semibold",
                !currentMonth && "opacity-20",
                isToday(date) &&
                  "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground",
              )}
            >
              {day}
            </motion.span>

            {!isMobile && renderDayCreate && (
              <motion.span className="flex justify-center items-center group">
                {renderDayCreate(date)}
              </motion.span>
            )}
          </motion.div>

          <motion.div
            className={cn(
              "flex h-fit gap-1 px-2 mt-1 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
              !currentMonth && "opacity-50",
            )}
          >
            {cellEvents.length >= 0 &&
              !isMobile &&
              [0, 1, 2].map(renderEventAtPosition)}
          </motion.div>

          {showMobileMore && (
            <div className="flex justify-end items-end mx-2">
              <span className="text-[0.6rem] font-semibold text-accent-foreground">
                +{showMoreCount}
              </span>
            </div>
          )}

          {showDesktopMore && (
            <motion.div
              className={cn(
                "h-4.5 px-1.5 my-2 text-end text-xs font-semibold text-muted-foreground",
                !currentMonth && "opacity-50",
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...transition }}
            >
              <EventListDialog date={date} tasks={cellEvents} />
            </motion.div>
          )}
        </DroppableArea>
      </motion.div>
    ),
    [
      date,
      day,
      currentMonth,
      cellEvents,
      showMobileMore,
      showDesktopMore,
      showMoreCount,
      renderEventAtPosition,
      isMobile,
      renderDayCreate,
    ],
  );

  if (isMobile && currentMonth) {
    return (
      <EventListDialog date={date} tasks={cellEvents}>
        {cellContent}
      </EventListDialog>
    );
  }

  return cellContent;
}
