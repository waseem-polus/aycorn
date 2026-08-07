import { useQuery } from "@tanstack/react-query";
import type { TaskWithProject } from "@/types/types";

export function useAllTasksForRelationshipQuery(enabled: boolean) {
  return useQuery<TaskWithProject[]>({
    queryKey: ["allTasksForRelationship"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled,
  });
}
