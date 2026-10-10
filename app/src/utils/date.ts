import { endOfDay, format, parseISO, startOfDay } from "date-fns";

/* ------------------------------------------------------------------ *
 * Wire format — the API boundary
 *
 * Every timestamp sent to or read from the server goes through these.
 * The canonical encoding is RFC3339 at second precision in UTC, matching
 * `timefmt.Layout` on the server and the format stored in SQLite.
 * ------------------------------------------------------------------ */

/**
 * Serialize an instant for the API as `2026-08-12T05:00:00Z`.
 *
 * Dropping the milliseconds is not cosmetic: SQLite compares these as plain
 * strings, and `'…59.999Z'` sorts BELOW `'…59Z'` because `.` (0x2E) < `Z`
 * (0x5A). A bare `toISOString()` emits `.000Z` and silently breaks range
 * boundary comparisons.
 */
export const toApiDate = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, "Z");

/** Parse a timestamp coming back from the API. */
export const parseApiDate = (iso: string): Date => parseISO(iso);

/** Start of `date`'s local calendar day, as a wire-format instant. */
export const toApiDayStart = (date: Date): string => toApiDate(startOfDay(date));

/**
 * End of `date`'s local calendar day, as a wire-format instant.
 *
 * This is what makes an all-day range bound inclusive: a filter "through
 * Aug 22" has to cover everything up to Aug 22 23:59:59, not stop at its
 * midnight.
 */
export const toApiDayEnd = (date: Date): string => toApiDate(endOfDay(date));

/* ------------------------------------------------------------------ *
 * Local calendar-day helpers — date-picker internals
 *
 * These work in the viewer's local timezone, because that is the calendar
 * the user is picking days off of.
 * ------------------------------------------------------------------ */

/**
 * Parse either a full instant or a bare `YYYY-MM-DD` into a local Date.
 * A bare date string is built component-wise so it lands on local midnight
 * rather than being read as UTC.
 */
export const parseLocalDate = (s: string): Date => {
  if (s.includes("T")) return new Date(s);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** `2026-08-12` — a local calendar day with no time component. */
export const toYMD = (date: Date): string => format(date, "yyyy-MM-dd");

/** `14:30` — the local wall-clock time of an instant, or "" if it has none. */
export const getTimeFromISO = (iso: string | null): string => {
  if (!iso || !iso.includes("T")) return "";
  return format(new Date(iso), "HH:mm");
};

/** Apply a `HH:mm` local wall-clock time to an existing date. */
export const setTimeOnDate = (
  isoDate: string | null,
  time: string,
): string | null => {
  if (!isoDate || !time) return isoDate;
  const d = parseLocalDate(isoDate);
  const [hours, minutes] = time.split(":").map(Number);
  d.setHours(hours, minutes, 0, 0);
  return toApiDate(d);
};

/** Drop the time component, keeping the same local calendar day. */
export const clearTimeFromISO = (iso: string | null): string | null => {
  if (!iso) return iso;
  return toApiDayStart(new Date(iso));
};

/* ------------------------------------------------------------------ *
 * Display formatting
 * ------------------------------------------------------------------ */

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
