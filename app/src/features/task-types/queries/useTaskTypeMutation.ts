import type { TaskType } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  return { createTaskType, updateTaskType, deleteTaskType };
}
