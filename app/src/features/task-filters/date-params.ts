import type { DateFilterMode } from "@/features/task-filters/task-filters";
import { parseApiDate, toApiDate, toApiDayEnd } from "@/utils/date";

/**
 * Lower bound of a date range. Sent as-is: when the user picked a whole day
 * rather than a time, the stored value is already that day's local midnight,
 * which is exactly where the range should start.
 */
export const setRangeStart = (url: URL, key: string, value: string | undefined) => {
  if (!value) return;
  url.searchParams.set(key, toApiDate(parseApiDate(value)));
};

/**
 * Upper bound of a date range. The server compares bounds inclusively against
 * stored instants, so a whole-day selection has to be extended to that day's
 * END — a range "through Aug 22" bounded at Aug 22 00:00 would exclude
 * everything that actually happened on Aug 22. When the user did specify a
 * time, their instant is the bound.
 */
export const setRangeEnd = (
  url: URL,
  key: string,
  value: string | undefined,
  hasTime: boolean | undefined,
) => {
  if (!value) return;
  const date = parseApiDate(value);
  url.searchParams.set(key, hasTime ? toApiDate(date) : toApiDayEnd(date));
};

/**
 * Translates a date mode into the server's presence param and reports whether
 * range bounds still apply. "with" asks for tasks that have the date at all —
 * an unset range then means "any date" rather than "no filter".
 */
export const setPresence = (
  url: URL,
  key: string,
  mode: DateFilterMode | undefined,
) => {
  const resolved = mode ?? "all";
  if (resolved === "all") return false;
  url.searchParams.set(key, resolved === "none" ? "none" : "any");
  return resolved === "with";
};
