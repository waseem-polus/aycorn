import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type {
  DateRef,
  RelativeAnchor,
  RelativeUnit,
} from "@/features/task-filters/conditions/condition-types";
import type { WeekStartsOn } from "@/features/settings/settings-types";
import { formatMonthDay, parseLocalDate, toYMD } from "@/utils/date";

/** What a relative date needs to become real days. */
export type DateContext = { today: Date; weekStartsOn: WeekStartsOn };

/** An inclusive run of local days; `start` and `end` are both midnights. */
export type DaySpan = { start: Date; end: Date };

/** Amounts the custom builder accepts, so a typo can't ask for 10,000 months. */
export const MAX_RELATIVE_AMOUNT = 365;

const addUnit = (date: Date, amount: number, unit: RelativeUnit): Date => {
  switch (unit) {
    case "day":
      return addDays(date, amount);
    case "week":
      return addWeeks(date, amount);
    case "month":
      return addMonths(date, amount);
    case "year":
      return addYears(date, amount);
  }
};

/** The whole calendar week, month or year `offset` units from `day`. */
const periodSpan = (
  day: Date,
  offset: number,
  unit: Exclude<RelativeUnit, "day">,
  weekStartsOn: WeekStartsOn,
): DaySpan => {
  switch (unit) {
    case "week": {
      const target = addWeeks(day, offset);
      return {
        start: startOfWeek(target, { weekStartsOn }),
        end: startOfDay(endOfWeek(target, { weekStartsOn })),
      };
    }
    case "month": {
      const target = addMonths(day, offset);
      return { start: startOfMonth(target), end: startOfDay(endOfMonth(target)) };
    }
    case "year": {
      const target = addYears(day, offset);
      return { start: startOfYear(target), end: startOfDay(endOfYear(target)) };
    }
  }
};

const resolveAnchor = (anchor: RelativeAnchor, { today, weekStartsOn }: DateContext): DaySpan => {
  const day = startOfDay(today);
  switch (anchor.type) {
    case "offset": {
      // A day shift is one day; a week, month or year shift is that whole
      // calendar period ("2 weeks from now" = the week that day falls in).
      if (anchor.unit !== "day") return periodSpan(day, anchor.amount, anchor.unit, weekStartsOn);
      const target = addDays(day, anchor.amount);
      return { start: target, end: target };
    }
    case "window": {
      // Today counts as the first day: "next 7 days" is today + 6 more,
      // "last 7 days" is 6 days ago through today.
      const far = addUnit(day, anchor.amount, anchor.unit);
      return anchor.amount >= 0
        ? { start: day, end: addDays(far, -1) }
        : { start: addDays(far, 1), end: day };
    }
    case "period":
      return periodSpan(day, anchor.offset, anchor.unit, weekStartsOn);
  }
};

/**
 * The days a ref covers today. Every operator then reads one side of it:
 * before = before `start`, after = after `end`, on = within the span.
 */
export const resolveDateRef = (ref: DateRef, ctx: DateContext): DaySpan => {
  if (ref.kind === "absolute") {
    const day = parseLocalDate(ref.date);
    return { start: day, end: day };
  }
  return resolveAnchor(ref.anchor, ctx);
};

/** How far from today an anchor reaches, signed, whichever shape carries it. */
export const signedAmount = (anchor: RelativeAnchor): number =>
  anchor.type === "period" ? anchor.offset : anchor.amount;

export const sameAnchor = (a: RelativeAnchor, b: RelativeAnchor): boolean =>
  a.type === b.type && a.unit === b.unit && signedAmount(a) === signedAmount(b);

/** The one-click days above the custom builder: Yesterday, Today, Tomorrow. */
export const QUICK_PICK_ANCHORS: RelativeAnchor[] = [-1, 0, 1].map((amount) => ({
  type: "offset",
  amount,
  unit: "day",
}));

export const isQuickPick = (anchor: RelativeAnchor): boolean =>
  QUICK_PICK_ANCHORS.some((pick) => sameAnchor(pick, anchor));

export const isDateRefComplete = (ref: DateRef | null): ref is DateRef =>
  !!ref && (ref.kind === "relative" || !!ref.date);

const plural = (n: number, unit: RelativeUnit) => `${n} ${unit}${n === 1 ? "" : "s"}`;

const anchorLabel = (anchor: RelativeAnchor): string => {
  switch (anchor.type) {
    case "offset": {
      if (anchor.unit === "day" && anchor.amount === 0) return "Today";
      if (anchor.unit === "day" && anchor.amount === -1) return "Yesterday";
      if (anchor.unit === "day" && anchor.amount === 1) return "Tomorrow";
      if (anchor.amount === 0) return "Today";
      const n = plural(Math.abs(anchor.amount), anchor.unit);
      return anchor.amount < 0 ? `${n} ago` : `${n} from now`;
    }
    case "window":
      return `${anchor.amount < 0 ? "Last" : "Next"} ${plural(Math.abs(anchor.amount), anchor.unit)}`;
    case "period": {
      if (anchor.offset === 0) return `This ${anchor.unit}`;
      if (anchor.offset === -1) return `Last ${anchor.unit}`;
      if (anchor.offset === 1) return `Next ${anchor.unit}`;
      // "Whole" keeps it apart from the single-day offset of the same distance.
      const n = plural(Math.abs(anchor.offset), anchor.unit);
      return `Whole ${anchor.unit}, ${anchor.offset < 0 ? `${n} ago` : `${n} from now`}`;
    }
  }
};

/** How a ref reads on its button: the relative name, or the formatted day. */
export const dateRefLabel = (ref: DateRef): string =>
  ref.kind === "absolute" ? formatMonthDay(parseLocalDate(ref.date), true) : anchorLabel(ref.anchor);

/** What a relative ref means today, e.g. "Nov 4 – Nov 10", for the muted hint. */
export const dateSpanHint = (span: DaySpan): string =>
  isSameDay(span.start, span.end)
    ? formatMonthDay(span.start)
    : `${formatMonthDay(span.start)} – ${formatMonthDay(span.end)}`;

/** Switching to the Relative tab keeps the same day, as an offset from today. */
export const toRelativeRef = (ref: DateRef | null, ctx: DateContext): DateRef | null =>
  ref?.kind === "absolute" && ref.date
    ? {
        kind: "relative",
        anchor: {
          type: "offset",
          amount: differenceInCalendarDays(parseLocalDate(ref.date), ctx.today),
          unit: "day",
        },
      }
    : ref;

/**
 * Switching to the Date tab pins what the ref means today. A span collapses
 * to the edge this end of the condition reads: a range's `to` takes the
 * span's last day, everything else its first.
 */
export const toAbsoluteRef = (
  ref: DateRef | null,
  ctx: DateContext,
  edge: "start" | "end" = "start",
): DateRef | null =>
  ref?.kind === "relative"
    ? { kind: "absolute", date: toYMD(resolveDateRef(ref, ctx)[edge]) }
    : ref;
