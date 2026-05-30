import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { DraggableEvent } from "@/features/calendar/dragAndDrop/draggable-event";
import { formatTime } from "@/features/calendar/helpers";
import {
  getTaskStartDate,
  getTaskEndDate,
  getTaskColor,
} from "@/features/calendar/interfaces";
import {
  stageCalendarBadgeClass,
  stageCalendarDotClass,
} from "@/features/stage/stage-palette";
import type { ChecklistTask } from "@/types/types";
import { EventBullet } from "@/features/calendar/views/monthView";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";

const eventBadgeVariants = cva(
  "flex w-full h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs cursor-grab",
  {
    variants: {
      multiDayPosition: {
        first: "relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5",
        middle:
          "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
        last: "ml-0 rounded-l-none border-l-0",
        none: "",
      },
    },
  },
);

interface IProps extends Omit<
  VariantProps<typeof eventBadgeVariants>,
  "multiDayPosition"
> {
  task: ChecklistTask;
  cellDate: Date;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  className?: string;
  position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
  task,
  cellDate,
  eventCurrentDay,
  eventTotalDays,
  className,
  position: propPosition,
}: IProps) {
  const { SetViewSettings, ViewSettings } = useContext(ProjectContext);
  const setTaskEditorDrawerOpen = useCallback(
    (open: boolean) =>
      SetViewSettings({ ...ViewSettings, isTaskEditorOpen: open }),
    [SetViewSettings, ViewSettings],
  );

  const { badgeVariant, use24HourFormat } = useCalendar();

  const itemStart = startOfDay(parseISO(getTaskStartDate(task)));
  const itemEnd = endOfDay(parseISO(getTaskEndDate(task)));

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none" | undefined;

  if (propPosition) {
    position = propPosition;
  } else if (eventCurrentDay && eventTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const renderBadgeText = ["first", "none"].includes(position);
  const renderBadgeTime = ["last", "none"].includes(position);

  const taskColor = getTaskColor(task);
  const colorClass =
    badgeVariant === "dot"
      ? cn("bg-bg-secondary text-t-primary", stageCalendarDotClass(taskColor))
      : stageCalendarBadgeClass(taskColor);

  const eventBadgeClasses = cn(
    eventBadgeVariants({ multiDayPosition: position }),
    colorClass,
    className,
  );

  const marginClass = {
    first: "ml-1 mr-0",
    middle: "mx-0",
    last: "ml-0 mr-1",
    none: "mx-1",
  }[position || "none"];

  return (
    <DraggableEvent event={task} className={marginClass}>
      <TaskProvider defaultState={task}>
        <TaskEditorDrawer onOpenChange={setTaskEditorDrawerOpen}>
          <button type="button" className={eventBadgeClasses}>
            <div className="flex items-center gap-1.5 truncate">
              {!["middle", "last"].includes(position) &&
                badgeVariant === "dot" && <EventBullet color={taskColor} />}

              {renderBadgeText && (
                <p className="flex-1 truncate font-semibold">
                  {eventCurrentDay && (
                    <span className="text-xs">
                      Day {eventCurrentDay} of {eventTotalDays}{" "}
                    </span>
                  )}
                  {task.Name}
                </p>
              )}
            </div>

            <div className="hidden sm:block">
              {renderBadgeTime && (
                <span>
                  {formatTime(
                    new Date(getTaskStartDate(task)),
                    use24HourFormat,
                  )}
                </span>
              )}
            </div>
          </button>
        </TaskEditorDrawer>
      </TaskProvider>
    </DraggableEvent>
  );
}
