import { useQuery } from "@tanstack/react-query";
import type { WorkflowSummary } from "@/types/types";

export function useAllWorkflowsQuery() {
  const { isPending, error, data, isFetching, refetch } = useQuery<
    WorkflowSummary[]
  >({
    queryKey: ["allWorkflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflow");
      return await res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
