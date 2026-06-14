import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";

type SubtaskProgress = {
  done: number;
  total: number;
};

export function useSubtaskProgress(taskId: number): SubtaskProgress | null {
  const { data } = useTaskRelationshipsQuery(taskId);
  if (!data) return null;

  const subtasks = data.filter(
    (rel) => rel.Type.Behavior === "subtask" && rel.Direction === "from",
  );
  if (subtasks.length === 0) return null;

  const done = subtasks.filter((rel) => rel.Other.IsDone).length;
  return { done, total: subtasks.length };
}
