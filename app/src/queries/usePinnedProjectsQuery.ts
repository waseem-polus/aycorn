import { useQuery } from "@tanstack/react-query";
import type { Project } from "@/types/types";

// Server-ordered by the user's manual pin order; render the list as-is.
export function usePinnedProjectsQuery() {
  return useQuery<Project[]>({
    queryKey: ["pinnedProjects"],
    queryFn: async () => {
      const res = await fetch("/api/project/pinned");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
