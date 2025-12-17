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

  const toISO = (source: Date | string | null): string => {
    if (source === null) {
      return "";
    }

    const date = typeof source === "string" ? new Date(source) : source;
    return date.toISOString();
  };

  return { toFormatted, toISO };
}
