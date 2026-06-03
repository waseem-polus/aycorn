import type { TaskFacets } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useTaskFacetsQuery() {
  return useQuery<TaskFacets>({
    queryKey: ["taskFacets"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/facets");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
