import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";

export function useUnresolvedBlockerCount(taskId: number) {
  const { data } = useTaskRelationshipsQuery(taskId);
  if (!data) return 0;
  return data.filter(
    (rel) => rel.Type.Behavior === "blocking" && rel.Direction === "to" && !rel.Other.IsDone,
  ).length;
}
