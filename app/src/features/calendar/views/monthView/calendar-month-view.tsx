import { motion } from "framer-motion";
import { useMemo } from "react";
import { staggerContainer, transition } from "@/features/calendar/animations";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";

import {
  calculateMonthEventPositions,
  getCalendarCells,
} from "@/features/calendar/helpers";

import type { ChecklistTask } from "@/types/types";
import { DayCell } from "@/features/calendar/views/monthView";

interface IProps {
  singleDayEvents: ChecklistTask[];
  multiDayEvents: ChecklistTask[];
  setTaskDrawerOpen: (open: boolean) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  singleDayEvents,
  multiDayEvents,
  setTaskDrawerOpen,
}: IProps) {
  const { selectedDate } = useCalendar();

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () =>
      calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate,
      ),
    [multiDayEvents, singleDayEvents, selectedDate],
  );

  return (
    <motion.div
      className="w-full h-full min-h-0 overflow-hidden box-border pb-10"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day, index) => (
          <motion.div
            key={day}
            className="flex items-center justify-center py-2 border-b"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
          >
            <span className="text-xs font-medium text-t-quaternary">{day}</span>
          </motion.div>
        ))}
      </div>

      <div className="h-full min-h-0 overflow-auto">
        <div className="grid grid-cols-7 h-fit min-h-fit overflow-visible">
          {cells.map((cell) => (
            <DayCell
              key={cell.date.toISOString()}
              cell={cell}
              events={allEvents}
              eventPositions={eventPositions}
              setTaskDrawerOpen={setTaskDrawerOpen}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
