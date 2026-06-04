import type { TaskTypeGlobal } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export type TaskTypeUsageFilter = "all" | "in-use" | "unused";

export function useTaskTypesQuery(filter: TaskTypeUsageFilter = "all") {
  return useQuery<TaskTypeGlobal[]>({
    queryKey: ["taskTypes", filter],
    queryFn: async () => {
      const url =
        filter !== "all"
          ? `/api/task-type?filter=${filter}`
          : "/api/task-type";
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
