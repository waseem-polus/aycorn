import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import type { ICalendarCell } from "@/features/calendar/interfaces";
import {
  getTaskStartDate,
  getTaskEndDate,
} from "@/features/calendar/interfaces";
import type { TCalendarView, TEventColor } from "@/features/calendar/types";
import type { ChecklistTask } from "@/types/types";

const FORMAT_STRING = "MMM d, yyyy";

export function rangeText(view: TCalendarView, date: Date): string {
  let start: Date;
  let end: Date;

  switch (view) {
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case "day":
      return format(date, FORMAT_STRING);
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "agenda":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    default:
      return "Error while formatting";
  }

  return `${format(start, FORMAT_STRING)} - ${format(end, FORMAT_STRING)}`;
}

export function navigateDate(
  date: Date,
  view: TCalendarView,
  direction: "previous" | "next",
): Date {
  const operations: Record<TCalendarView, (d: Date, n: number) => Date> = {
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
    year: direction === "next" ? addYears : subYears,
    agenda: direction === "next" ? addMonths : subMonths,
  };

  return operations[view](date, 1);
}

export function getEventsCount(
  events: ChecklistTask[],
  date: Date,
  view: TCalendarView,
): number {
  const compareFns: Record<TCalendarView, (d1: Date, d2: Date) => boolean> = {
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
    year: isSameYear,
    agenda: isSameMonth,
  };

  const compareFn = compareFns[view];
  return events.filter((event) =>
    compareFn(parseISO(getTaskStartDate(event)), date),
  ).length;
}

export function groupEvents(dayEvents: ChecklistTask[]): ChecklistTask[][] {
  const sortedEvents = dayEvents.sort(
    (a, b) =>
      parseISO(getTaskStartDate(a)).getTime() -
      parseISO(getTaskStartDate(b)).getTime(),
  );
  const groups: ChecklistTask[][] = [];

  for (const event of sortedEvents) {
    const eventStart = parseISO(getTaskStartDate(event));
    let placed = false;

    for (const group of groups) {
      const lastEventInGroup = group[group.length - 1];
      const lastEventEnd = parseISO(getTaskEndDate(lastEventInGroup));

      if (eventStart >= lastEventEnd) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([event]);
  }

  return groups;
}

export function getEventBlockStyle(
  event: ChecklistTask,
  day: Date,
  groupIndex: number,
  groupSize: number,
) {
  const startDate = parseISO(getTaskStartDate(event));
  const dayStart = startOfDay(day);
  const eventStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(eventStart, dayStart);

  const top = (startMinutes / 1440) * 100;
  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const daysInMonth = endOfMonth(selectedDate).getDate();
  const firstDayOfMonth = startOfMonth(selectedDate).getDay();
  const daysInPrevMonth = endOfMonth(new Date(year, month - 1)).getDate();
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(year, month, i + 1),
  }));

  const nextMonthCells = Array.from(
    { length: (7 - (totalDays % 7)) % 7 },
    (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(year, month + 1, i + 1),
    }),
  );

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(
  multiDayEvents: ChecklistTask[],
  singleDayEvents: ChecklistTask[],
  selectedDate: Date,
): Record<string, number> {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: Record<string, number> = {};
  const occupiedPositions: Record<string, boolean[]> = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedEvents = [
    ...multiDayEvents.sort((a, b) => {
      const aDuration = differenceInDays(
        parseISO(getTaskEndDate(a)),
        parseISO(getTaskStartDate(a)),
      );
      const bDuration = differenceInDays(
        parseISO(getTaskEndDate(b)),
        parseISO(getTaskStartDate(b)),
      );
      return (
        bDuration - aDuration ||
        parseISO(getTaskStartDate(a)).getTime() -
          parseISO(getTaskStartDate(b)).getTime()
      );
    }),
    ...singleDayEvents.sort(
      (a, b) =>
        parseISO(getTaskStartDate(a)).getTime() -
        parseISO(getTaskStartDate(b)).getTime(),
    ),
  ];

  sortedEvents.forEach((event) => {
    const eventStart = parseISO(getTaskStartDate(event));
    const eventEnd = parseISO(getTaskEndDate(event));
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    });

    let position = -1;

    for (let i = 0; i < 3; i++) {
      if (
        eventDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      eventDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      eventPositions[event.ID] = position;
    }
  });

  return eventPositions;
}

export function getMonthCellEvents(
  date: Date,
  events: ChecklistTask[],
  eventPositions: Record<string, number>,
) {
  const dayStart = startOfDay(date);
  const eventsForDate = events.filter((event) => {
    const eventStart = parseISO(getTaskStartDate(event));
    const eventEnd = parseISO(getTaskEndDate(event));
    return (
      (dayStart >= eventStart && dayStart <= eventEnd) ||
      isSameDay(dayStart, eventStart) ||
      isSameDay(dayStart, eventEnd)
    );
  });

  return eventsForDate
    .map((event) => ({
      ...event,
      position: eventPositions[event.ID] ?? -1,
      isMultiDay: getTaskStartDate(event) !== getTaskEndDate(event),
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}

export function formatTime(
  date: Date | string,
  use24HourFormat: boolean,
): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";
  return format(parsedDate, use24HourFormat ? "HH" : "h a");
}

export const getFirstLetters = (str: string): string => {
  if (!str) return "";
  const words = str.split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0).toUpperCase()}${words[1].charAt(0).toUpperCase()}`;
};

export const getEventsForDay = (
  events: ChecklistTask[],
  date: Date,
  isWeek = false,
): (ChecklistTask & { point?: "start" | "end" | "none" })[] => {
  const targetDate = startOfDay(date);
  return events
    .filter((event) => {
      const startOfDayForEventStart = startOfDay(
        parseISO(getTaskStartDate(event)),
      );
      const startOfDayForEventEnd = startOfDay(parseISO(getTaskEndDate(event)));
      if (isWeek) {
        return (
          getTaskStartDate(event) !== getTaskEndDate(event) &&
          startOfDayForEventStart <= targetDate &&
          startOfDayForEventEnd >= targetDate
        );
      }
      return (
        startOfDayForEventStart <= targetDate &&
        startOfDayForEventEnd >= targetDate
      );
    })
    .map((event) => {
      const eventStart = startOfDay(parseISO(getTaskStartDate(event)));
      const eventEnd = startOfDay(parseISO(getTaskEndDate(event)));
      let point: "start" | "end" | "none" | undefined;

      if (isSameDay(eventStart, eventEnd)) {
        point = "none";
      } else if (isSameDay(eventStart, targetDate)) {
        point = "start";
      } else if (isSameDay(eventEnd, targetDate)) {
        point = "end";
      }

      return { ...event, point };
    });
};

export const getWeekDates = (date: Date): Date[] => {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

export const getEventsForWeek = (
  events: ChecklistTask[],
  date: Date,
): ChecklistTask[] => {
  const weekDates = getWeekDates(date);
  const startOfWeekDate = weekDates[0];
  const endOfWeekDate = weekDates[6];

  return events.filter((event) => {
    const eventStart = parseISO(getTaskStartDate(event));
    const eventEnd = parseISO(getTaskEndDate(event));
    return (
      isValid(eventStart) &&
      isValid(eventEnd) &&
      eventStart <= endOfWeekDate &&
      eventEnd >= startOfWeekDate
    );
  });
};

export const getEventsForMonth = (
  events: ChecklistTask[],
  date: Date,
): ChecklistTask[] => {
  const startOfMonthDate = startOfMonth(date);
  const endOfMonthDate = endOfMonth(date);

  return events.filter((event) => {
    const eventStart = parseISO(getTaskStartDate(event));
    const eventEnd = parseISO(getTaskEndDate(event));
    return (
      isValid(eventStart) &&
      isValid(eventEnd) &&
      eventStart <= endOfMonthDate &&
      eventEnd >= startOfMonthDate
    );
  });
};

export const getEventsForYear = (
  events: ChecklistTask[],
  date: Date,
): ChecklistTask[] => {
  if (!events || !Array.isArray(events) || !isValid(date)) return [];

  const startOfYearDate = startOfYear(date);
  const endOfYearDate = endOfYear(date);

  return events.filter((event) => {
    const eventStart = parseISO(getTaskStartDate(event));
    const eventEnd = parseISO(getTaskEndDate(event));
    return (
      isValid(eventStart) &&
      isValid(eventEnd) &&
      eventStart <= endOfYearDate &&
      eventEnd >= startOfYearDate
    );
  });
};

export const getColorClass = (color: string): string => {
  const colorClasses: Record<TEventColor, string> = {
    gray:    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
    slate:   "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    red:     "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    rose:    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
    orange:  "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    amber:   "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
    yellow:  "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    lime:    "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950 dark:text-lime-300",
    green:   "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    teal:    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
    cyan:    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
    sky:     "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
    blue:    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    indigo:  "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    violet:  "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
    purple:  "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
    fuchsia: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    pink:    "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
  };
  return colorClasses[color as TEventColor] || "";
};

export const getBgColor = (color: string): string => {
  const colorClasses: Record<TEventColor, string> = {
    gray:    "bg-neutral-400 dark:bg-neutral-500",
    slate:   "bg-slate-400 dark:bg-slate-500",
    red:     "bg-red-400 dark:bg-red-500",
    rose:    "bg-rose-400 dark:bg-rose-500",
    orange:  "bg-orange-400 dark:bg-orange-500",
    amber:   "bg-amber-400 dark:bg-amber-500",
    yellow:  "bg-yellow-400 dark:bg-yellow-500",
    lime:    "bg-lime-400 dark:bg-lime-500",
    green:   "bg-green-400 dark:bg-green-500",
    emerald: "bg-emerald-400 dark:bg-emerald-500",
    teal:    "bg-teal-400 dark:bg-teal-500",
    cyan:    "bg-cyan-400 dark:bg-cyan-500",
    sky:     "bg-sky-400 dark:bg-sky-500",
    blue:    "bg-blue-400 dark:bg-blue-500",
    indigo:  "bg-indigo-400 dark:bg-indigo-500",
    violet:  "bg-violet-400 dark:bg-violet-500",
    purple:  "bg-purple-400 dark:bg-purple-500",
    fuchsia: "bg-fuchsia-400 dark:bg-fuchsia-500",
    pink:    "bg-pink-400 dark:bg-pink-500",
  };
  return colorClasses[color as TEventColor] || "";
};

export const useGetEventsByMode = (events: ChecklistTask[]) => {
  const { view, selectedDate } = useCalendar();

  switch (view) {
    case "day":
      return getEventsForDay(events, selectedDate);
    case "week":
      return getEventsForWeek(events, selectedDate);
    case "agenda":
    case "month":
      return getEventsForMonth(events, selectedDate);
    case "year":
      return getEventsForYear(events, selectedDate);
    default:
      return [];
  }
};

export const toCapitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
