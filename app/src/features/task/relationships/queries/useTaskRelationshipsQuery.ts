import { useQuery } from "@tanstack/react-query";
import type { TaskRelationship, TaskRelationshipsResult } from "@/types/types";

const fetchTaskRelationships = async (
  taskId: number,
): Promise<TaskRelationshipsResult> => {
  const res = await fetch(`/api/task/relationships/${taskId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function useTaskRelationshipsQuery(taskId: number) {
  return useQuery({
    queryKey: ["taskRelationships", taskId],
    queryFn: () => fetchTaskRelationships(taskId),
    enabled: taskId !== 0,
    select: (result): TaskRelationship[] => result.Relationships,
  });
}
