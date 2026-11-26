import type { Usage } from "@/features/usage/types";
import { useQuery } from "@tanstack/react-query";

/** The longest range the activity chart offers; shorter ranges slice it. */
export const USAGE_ACTIVITY_DAYS = 90;

export function useUsageQuery() {
  return useQuery<Usage>({
    queryKey: ["usage", USAGE_ACTIVITY_DAYS],
    queryFn: async () => {
      const res = await fetch(`/api/usage?days=${USAGE_ACTIVITY_DAYS}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
