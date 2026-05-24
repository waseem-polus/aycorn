import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fadeIn,
  staggerContainer,
  transition,
} from "@/features/calendar/animations";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { DroppableArea } from "@/features/calendar/dragAndDrop/droppable-area";
import { groupEvents } from "@/features/calendar/helpers";
import {
  getTaskStartDate,
  getTaskEndDate,
} from "@/features/calendar/interfaces";
import type { ChecklistTask } from "@/types/types";
import { CalendarTimeline } from "@/features/calendar/views/weekView/calendar-time-line";
import { RenderGroupedEvents } from "@/features/calendar/views/weekView/render-grouped-events";
import { WeekViewMultiDayEventsRow } from "@/features/calendar/views/weekView/week-view-multi-day-events-row";
import { NewTaskEditorDrawer } from "./new-task-editor-drawer";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";

interface IProps {
  singleDayEvents: ChecklistTask[];
  multiDayEvents: ChecklistTask[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, use24HourFormat } = useCalendar();

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const { SetViewSettings, ViewSettings } = useContext(ProjectContext);
  const handleOpenModal = useCallback(
    (open: boolean) => {
      SetViewSettings({
        ...ViewSettings,
        isTaskEditorOpen: open,
      });
    },
    [SetViewSettings, ViewSettings],
  );

  return (
    <motion.div
      initial="initial"
      className="w-full"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={transition}
    >
      <motion.div
        className="flex flex-col items-center justify-center border-b p-4 text-sm sm:hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <p>Weekly view is not recommended on smaller devices.</p>
        <p>Please switch to a desktop device or use the daily view instead.</p>
      </motion.div>

      <motion.div className="flex-col sm:flex" variants={staggerContainer}>
        <div>
          <WeekViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
          />

          <motion.div
            className="relative z-20 flex border-b"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7  border-l">
              {weekDays.map((day, index) => (
                <motion.span
                  key={day.toISOString()}
                  className="py-1 sm:py-2 text-center text-xs font-medium text-t-quaternary"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ...transition }}
                >
                  <span className="block sm:hidden">
                    {format(day, "EEE").charAt(0)}
                    <span className="block font-semibold text-t-secondary text-xs">
                      {format(day, "d")}
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    {format(day, "EE")}{" "}
                    <span className="ml-1 font-semibold text-t-secondary">
                      {format(day, "d")}
                    </span>
                  </span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex">
            <motion.div className="relative w-18" variants={staggerContainer}>
              {hours.map((hour, index) => (
                <motion.div
                  key={hour}
                  className="relative"
                  style={{ height: "96px" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, ...transition }}
                >
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-t-quaternary">
                        {format(
                          new Date().setHours(hour, 0, 0, 0),
                          use24HourFormat ? "HH:00" : "h a",
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="relative flex-1 border-l"
              variants={staggerContainer}
            >
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(
                    (event) =>
                      isSameDay(parseISO(getTaskStartDate(event)), day) ||
                      isSameDay(parseISO(getTaskEndDate(event)), day),
                  );
                  const groupedEvents = groupEvents(dayEvents);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      className="relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: dayIndex * 0.1, ...transition }}
                    >
                      {hours.map((hour, index) => (
                        <motion.div
                          key={hour}
                          className="relative"
                          style={{ height: "96px" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.01, ...transition }}
                        >
                          {index !== 0 && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                          )}

                          <DroppableArea
                            date={day}
                            hour={hour}
                            minute={0}
                            className="absolute inset-x-0 top-0  h-[48px]"
                          >
                            <TaskProvider>
                              <NewTaskEditorDrawer
                                date={day}
                                startTime={{ hour, minute: 0 }}
                                setTaskDrawerOpen={handleOpenModal}
                              />
                            </TaskProvider>
                          </DroppableArea>

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>

                          <DroppableArea
                            date={day}
                            hour={hour}
                            minute={30}
                            className="absolute inset-x-0 bottom-0 h-[48px]"
                          >
                            <TaskProvider>
                              <NewTaskEditorDrawer
                                date={day}
                                startTime={{ hour, minute: 30 }}
                                setTaskDrawerOpen={handleOpenModal}
                              />
                            </TaskProvider>
                          </DroppableArea>
                        </motion.div>
                      ))}

                      <RenderGroupedEvents
                        groupedEvents={groupedEvents}
                        day={day}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <CalendarTimeline />
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}
