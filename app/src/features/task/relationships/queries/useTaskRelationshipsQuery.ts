import { useQuery } from "@tanstack/react-query";
import type { TaskRelationship } from "@/types/types";

export function useTaskRelationshipsQuery(taskId: number) {
  return useQuery<TaskRelationship[]>({
    queryKey: ["taskRelationships", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/task/relationships/${taskId}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: taskId !== 0,
  });
}
