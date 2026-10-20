/** An accordion row's summary: "Any" when nothing is set, the one selected name when that says it best, otherwise a count. */
export const summarizeFilters = (count: number, singleLabel?: string) =>
  count === 0 ? "Any" : count === 1 && singleLabel ? singleLabel : `${count} active`;
