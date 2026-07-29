import { useQuery } from "@tanstack/react-query";
import type { TaskRelationshipType } from "@/types/types";

export type RelationshipBehaviorFilter = "all" | "blocking" | "subtask" | "link";

export function useTaskRelationshipTypesQuery(
  search = "",
  behavior: RelationshipBehaviorFilter = "all",
) {
  return useQuery<TaskRelationshipType[]>({
    queryKey: ["taskRelationshipTypes", search, behavior],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (behavior !== "all") params.set("behavior", behavior);
      const qs = params.toString();
      const url = qs
        ? `/api/task-relationship-type?${qs}`
        : "/api/task-relationship-type";
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
