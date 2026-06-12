import { queryClient } from "@/main";
import type { BulkResult, ProjectDetails, Task } from "@/types/types";
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
  queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
};

export function useTaskMutation(projectId: number) {
  const update = useMutation({
    mutationFn: getSaveTaskQuery(false),
    onMutate: async (task: Task) => {
      await queryClient.cancelQueries({ queryKey: ["projectDetails", projectId] });
      const previous = queryClient.getQueryData<ProjectDetails>(["projectDetails", projectId]);
      queryClient.setQueryData<ProjectDetails>(["projectDetails", projectId], (old) => {
        if (!old) return old;

        const oldTask = old.Tasks.find((t) => t.ID === task.ID);
        let checklists = old.Checklists;

        if (oldTask && oldTask.Checklist !== task.Checklist) {
          const isDone = old.Stages.find((s) => s.ID === task.Stage)?.Type === "done";
          checklists = old.Checklists.map((c) => {
            if (c.ID === oldTask.Checklist) {
              const total = c.TotalCount - 1;
              const done = isDone ? c.DoneCount - 1 : c.DoneCount;
              return {
                ...c,
                TotalCount: total,
                DoneCount: done,
                Status: total === 0 ? "unused" : done === total ? "done" : "doing",
                StageCounts: c.StageCounts
                  .map((sc) => sc.StageID === task.Stage ? { ...sc, Count: sc.Count - 1 } : sc)
                  .filter((sc) => sc.Count > 0),
              };
            }
            if (c.ID === task.Checklist) {
              const total = c.TotalCount + 1;
              const done = isDone ? c.DoneCount + 1 : c.DoneCount;
              const existing = c.StageCounts.find((sc) => sc.StageID === task.Stage);
              return {
                ...c,
                TotalCount: total,
                DoneCount: done,
                Status: done === total ? "done" : "doing",
                StageCounts: existing
                  ? c.StageCounts.map((sc) => sc.StageID === task.Stage ? { ...sc, Count: sc.Count + 1 } : sc)
                  : [...c.StageCounts, { StageID: task.Stage, Count: 1 }],
              };
            }
            return c;
          });
        }

        return {
          ...old,
          Tasks: old.Tasks.map((t) => (t.ID === task.ID ? { ...t, ...task } : t)),
          Checklists: checklists,
        };
      });
      return { previous };
    },
    onError: (_err, _task, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projectDetails", projectId], context.previous);
      }
    },
    onSettled: () => invalidateQueries(projectId),
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
    onMutate: async ({ tasks, changes }: { tasks: Task[]; changes: Partial<Task> }) => {
      await queryClient.cancelQueries({ queryKey: ["projectDetails", projectId] });
      const previous = queryClient.getQueryData<ProjectDetails>(["projectDetails", projectId]);
      const ids = new Set(tasks.map((t) => t.ID));
      queryClient.setQueryData<ProjectDetails>(["projectDetails", projectId], (old) => {
        if (!old) return old;
        return { ...old, Tasks: old.Tasks.map((t) => (ids.has(t.ID) ? { ...t, ...changes } : t)) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projectDetails", projectId], context.previous);
      }
    },
    onSettled: () => invalidateQueries(projectId),
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
