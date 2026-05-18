export function useDateFormat() {
  const toFormatted = (source: Date | string | null): string => {
    if (source === null) {
      return "";
    }

    const date = typeof source === "string" ? new Date(source) : source;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toFormattedTime = (source: Date | string | null): string => {
    if (source === null) return "";
    const date = typeof source === "string" ? new Date(source) : source;
    if (date.getHours() === 0 && date.getMinutes() === 0) return "";
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
