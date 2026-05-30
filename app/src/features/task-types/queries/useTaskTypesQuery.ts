import type { TaskTypeGlobal } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useTaskTypesQuery() {
  return useQuery<TaskTypeGlobal[]>({
    queryKey: ["taskTypes"],
    queryFn: async () => {
      const res = await fetch("/api/task-type");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
