/** Strip the time portion, returning midnight of the same calendar day. */
export const dayOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** True when both dates fall on the same calendar day. */
export const isSameDay = (a: Date, b: Date) =>
  dayOnly(a).getTime() === dayOnly(b).getTime();

/** "Jan 5" / "Jan 5, 2026" */
export const formatMonthDay = (date: Date, includeYear = false): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  });

/** "Mon, Jan 5" */
export const formatWeekdayMonthDay = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

/** "Jan 2026" */
export const formatMonthYear = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

/** "Jan" — short month name, used for assembling week ranges. */
export const formatMonthShort = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "short" });
