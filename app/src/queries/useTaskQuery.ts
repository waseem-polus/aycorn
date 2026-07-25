import { useQuery } from "@tanstack/react-query";
import type { TaskWithProject } from "@/types/types";

const tryParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function useTaskQuery(taskId: number) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const raw = await fetch(`/api/task/${taskId}`).then((res) => res.json());
      const parsedBody =
        typeof raw.Body === "string" ? tryParse(raw.Body) : raw.Body;
      return {
        ...raw,
        Body: Array.isArray(parsedBody) ? parsedBody : [],
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
      // Always hand the editor a valid Plate document (an array). Guard against
      // an empty/invalid body (e.g. a row damaged by the historical body-clobber
      // bug) — JSON.parse("") throws, and a damaged row can parse to "".
      const parsed = typeof res === "string" ? tryParse(res) : res;
      return Array.isArray(parsed) ? parsed : [];
    },
    enabled: enabled && taskId !== 0,
  });

  return { isPending, error, data, isFetching, refetch };
}
