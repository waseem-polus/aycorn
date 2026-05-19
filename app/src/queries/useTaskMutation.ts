import { queryClient } from "@/main";
import type { Task } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const getSaveTaskQuery = (isNewTask: boolean) => {
  const method = isNewTask ? "POST" : "PUT";
  return async (task: Task) => {
    const res = await fetch("http://localhost:8000/api/task", {
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
      const res = await fetch(`http://localhost:8000/api/task/${taskId}`, {
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
      await Promise.all(
        targets.map((t) =>
          fetch("http://localhost:8000/api/task", {
            method: "PUT",
            body: JSON.stringify({
              ...t,
              ...changes,
              Body: JSON.stringify(t.Body),
            }),
          }),
        ),
      );
      return targets.length;
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const bulkDelete = useMutation({
    mutationFn: async (taskIds: number[]) => {
      await Promise.all(
        taskIds.map((id) =>
          fetch(`http://localhost:8000/api/task/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  return { update, create, deleteTask, bulkUpdate, bulkDelete };
}
