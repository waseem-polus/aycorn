import { formatMonthDay } from "@/utils/date";

export function useDateFormat(excludeYear: boolean = false) {
  const toFormatted = (source: Date | string | null): string => {
    if (source === null) {
      return "";
    }

    const date = typeof source === "string" ? new Date(source) : source;
    return formatMonthDay(date, !excludeYear);
  };

  const toFormattedTime = (source: Date | string | null): string => {
    if (source === null) return "";
    const date = typeof source === "string" ? new Date(source) : source;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toISO = (source: Date | string | null): string => {
    if (source === null) {
      return "";
    }

    const date = typeof source === "string" ? new Date(source) : source;
    return date.toISOString();
  };

  return { toFormatted, toFormattedTime, toISO };
}
