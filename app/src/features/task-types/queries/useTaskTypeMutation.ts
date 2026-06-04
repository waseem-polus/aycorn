import type { BulkResult, TaskType } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type TaskTypeChanges = Partial<Pick<TaskType, "Icon" | "Color" | "Category">>;

export function useTaskTypeMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["taskTypes"] });
  };

  const createTaskType = useMutation({
    mutationFn: async (tt: Partial<TaskType>) => {
      const res = await fetch("/api/task-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tt),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<TaskType>;
    },
    onSuccess: invalidate,
  });

  const updateTaskType = useMutation({
    mutationFn: async (tt: TaskType) => {
      const res = await fetch(`/api/task-type/${tt.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tt),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const deleteTaskType = useMutation({
    mutationFn: async ({
      id,
      transferTypeId,
    }: {
      id: number;
      transferTypeId: number;
    }) => {
      const res = await fetch(`/api/task-type/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferTypeId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const bulkUpdateTaskTypes = useMutation({
    mutationFn: async ({
      ids,
      changes,
    }: {
      ids: number[];
      changes: TaskTypeChanges;
    }) => {
      const res = await fetch("/api/task-type/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, changes }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BulkResult>;
    },
    onSuccess: invalidate,
  });

  const bulkDeleteTaskTypes = useMutation({
    mutationFn: async ({
      ids,
      taskMappings,
    }: {
      ids: number[];
      taskMappings: Record<number, number>;
    }) => {
      const res = await fetch("/api/task-type/bulk/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, taskMappings }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BulkResult>;
    },
    onSuccess: invalidate,
  });

  return {
    createTaskType,
    updateTaskType,
    deleteTaskType,
    bulkUpdateTaskTypes,
    bulkDeleteTaskTypes,
  };
}
