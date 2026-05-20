import { useQuery } from "@tanstack/react-query";
import type { WorkflowSummary } from "@/types/types";

export function useWorkflowDetailsQuery(
  workflowId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { isPending, error, data, isFetching, refetch } =
    useQuery<WorkflowSummary>({
      queryKey: ["workflowDetails", workflowId],
      queryFn: async () => {
        const res = await fetch(
          `/api/workflow/${workflowId}`,
        );
        return await res.json();
      },
      enabled,
    });

  return { isPending, error, data, isFetching, refetch };
}
