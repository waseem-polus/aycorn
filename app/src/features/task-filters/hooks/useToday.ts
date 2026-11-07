import { useEffect, useMemo, useState } from "react";
import { addDays, startOfDay } from "date-fns";
import { parseLocalDate, toYMD } from "@/utils/date";

/**
 * Today's local midnight, kept current. It rolls over at midnight and is
 * rechecked when the window regains focus or the tab becomes visible, since a
 * sleeping laptop can miss the timer. Relative date filters depend on it, so
 * their queries refetch when the day changes.
 */
export function useToday(): Date {
  const [day, setDay] = useState(() => toYMD(new Date()));

  useEffect(() => {
    const sync = () => setDay(toYMD(new Date()));

    const msToMidnight = addDays(startOfDay(new Date()), 1).getTime() - Date.now();
    // +1s so the timer never lands a hair before midnight.
    const timer = window.setTimeout(sync, msToMidnight + 1000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // Re-arm the midnight timer each time the day changes.
  }, [day]);

  return useMemo(() => parseLocalDate(day), [day]);
}
