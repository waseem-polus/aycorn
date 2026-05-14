import { useQuery } from "@tanstack/react-query";
import type { WorkflowSummary } from "@/types/types";

export function useWorkflowDetailsQuery(workflowId: number) {
  const { isPending, error, data, isFetching, refetch } =
    useQuery<WorkflowSummary>({
      queryKey: ["workflowDetails", workflowId],
      queryFn: async () => {
        const res = await fetch(
          `http://localhost:8000/api/workflow/${workflowId}`,
        );
        return await res.json();
      },
    });

  return { isPending, error, data, isFetching, refetch };
}
