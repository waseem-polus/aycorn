import type { TaskTypeCategory } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useTaskTypeCategoriesQuery() {
  return useQuery<TaskTypeCategory[]>({
    queryKey: ["taskTypeCategories"],
    queryFn: async () => {
      const res = await fetch("/api/task-type-category");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
