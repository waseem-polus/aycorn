import { useQuery } from "@tanstack/react-query";
import type { TaskRelationshipType } from "@/types/types";

export function useTaskRelationshipTypesQuery() {
  return useQuery<TaskRelationshipType[]>({
    queryKey: ["taskRelationshipTypes"],
    queryFn: async () => {
      const res = await fetch("/api/task-relationship-type");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
