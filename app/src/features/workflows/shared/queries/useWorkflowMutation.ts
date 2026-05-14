import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import type { Workflow } from "@/types/types";

export function useWorkflowMutation(workflowId: number) {
  const updateWorkflow = useMutation({
    mutationFn: async (workflow: Workflow) => {
      const res = await fetch(
        `http://localhost:8000/api/workflow/${workflow.ID}`,
        {
          method: "PUT",
          body: JSON.stringify(workflow),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `http://localhost:8000/api/workflow/${workflowId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete workflow");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  return { updateWorkflow, deleteWorkflow };
}
