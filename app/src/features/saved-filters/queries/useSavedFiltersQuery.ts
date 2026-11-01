import { useQuery } from "@tanstack/react-query";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

export const SAVED_FILTERS_KEY = ["savedFilters"] as const;

/**
 * Every saved filter with its pins. The list is small, so boards and the
 * /filters page all read this one query and derive what they need.
 */
export function useSavedFiltersQuery() {
  return useQuery<SavedFilter[]>({
    queryKey: SAVED_FILTERS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/filter");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
