import { useQuery } from "@tanstack/react-query";
import type { TaskWithProject } from "@/types/types";

export function useTaskQuery(taskId: number) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const raw = await fetch(`/api/task/${taskId}`).then((res) => res.json());
      return {
        ...raw,
        Body:
          typeof raw.Body === "string" && raw.Body !== ""
            ? JSON.parse(raw.Body)
            : [],
      } as TaskWithProject;
    },
    enabled: taskId !== 0,
  });
}

export function useTaskBodyQuery(taskId: number, enabled: boolean) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ["taskBody", taskId],
    queryFn: async () => {
      const res = await fetch(
        `/api/task/body/${taskId}`,
      ).then((res) => res.json());
      return typeof res === "string" ? JSON.parse(res) : res;
    },
    enabled: enabled && taskId !== 0,
  });

  return { isPending, error, data, isFetching, refetch };
}
