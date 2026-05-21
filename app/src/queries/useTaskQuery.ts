import { useQuery } from "@tanstack/react-query";

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
