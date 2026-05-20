import { queryClient } from "@/main";
import type { BulkResult, Task } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const getSaveTaskQuery = (isNewTask: boolean) => {
  const method = isNewTask ? "POST" : "PUT";
  return async (task: Task) => {
    const res = await fetch("/api/task", {
      method: method,
      body: JSON.stringify({ ...task, Body: JSON.stringify(task.Body) }),
    });
    return await res.json();
  };
};

const invalidateQueries = (projectId: number) => {
  queryClient.invalidateQueries({ queryKey: ["projectDetails", projectId] });
};

export function useTaskMutation(projectId: number) {
  const update = useMutation({
    mutationFn: getSaveTaskQuery(false),
    onSuccess: () => invalidateQueries(projectId),
  });
  const create = useMutation({
    mutationFn: getSaveTaskQuery(true),
    onSuccess: () => invalidateQueries(projectId),
  });
  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/task/${taskId}`, {
        method: "DELETE",
      });
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const bulkUpdate = useMutation({
    mutationFn: async ({
      tasks,
      changes,
    }: {
      tasks: Task[];
      changes: Partial<Task>;
    }) => {
      const targets = tasks.filter((t) =>
        Object.entries(changes).some(
          ([key, value]) => t[key as keyof Task] !== value,
        ),
      );
      if (targets.length === 0) {
        return { success: 0, failed: 0, skipped: 0 } as BulkResult;
      }
      const res = await fetch(`/api/task/bulk`, {
        method: "PUT",
        body: JSON.stringify({
          ids: targets.map((t) => t.ID),
          changes,
        }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update tasks");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const bulkDelete = useMutation({
    mutationFn: async (taskIds: number[]) => {
      const res = await fetch(`/api/task/bulk/delete`, {
        method: "POST",
        body: JSON.stringify(taskIds),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete tasks");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  return { update, create, deleteTask, bulkUpdate, bulkDelete };
}
