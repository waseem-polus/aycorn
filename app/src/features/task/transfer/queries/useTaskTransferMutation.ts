import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BulkDuplicateResult, BulkResult } from "@/types/types";

export type MoveTasksInput = {
  ids: number[];
  checklist: number;
  // Omitted when the destination project shares the source workflow — the
  // tasks then keep the stages they are already on.
  stage?: number;
};

export type CopyTasksInput = {
  ids: number[];
  // Omitted for a same-project duplicate: every copy stays where its source is.
  checklist?: number;
  stage?: number;
  copyRelationships: boolean;
};

/**
 * Moving and copying tasks across projects.
 *
 * No optimistic updates here, unlike the drag paths in `useTaskMutation`: a
 * transfer's destination usually isn't in the cache at all, so there is nothing
 * meaningful to patch ahead of the server's answer.
 */
export function useTaskTransferMutation() {
  const queryClient = useQueryClient();

  // A transfer touches two projects — the source loses the task and the
  // destination gains it — so the whole projectDetails prefix is invalidated
  // rather than one project's entry.
  const invalidate = (ids: number[]) => {
    queryClient.invalidateQueries({ queryKey: ["projectDetails"] });
    queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
    queryClient.invalidateQueries({ queryKey: ["taskFacets"] });
    queryClient.invalidateQueries({ queryKey: ["projectChecklists"] });
    queryClient.invalidateQueries({ queryKey: ["allTasksForRelationship"] });
    for (const id of ids) {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", id] });
    }
  };

  const moveTasks = useMutation({
    mutationFn: async (input: MoveTasksInput) => {
      const res = await fetch("/api/task/bulk/move", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to move tasks");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: (_result, { ids }) => invalidate(ids),
  });

  const copyTasks = useMutation({
    mutationFn: async (input: CopyTasksInput) => {
      const res = await fetch("/api/task/bulk/copy", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to copy tasks");
      }
      return (await res.json()) as BulkDuplicateResult;
    },
    onSuccess: (_result, { ids }) => invalidate(ids),
  });

  return { moveTasks, copyTasks };
}
