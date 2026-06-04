import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/main";
import type { BulkDuplicateResult, BulkResult, Workflow } from "@/types/types";

export function useWorkflowMutation(workflowId?: number) {
  const createWorkflow = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/workflow", {
        method: "POST",
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to create workflow");
      }
      return res.json() as Promise<number>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async (workflow: Workflow) => {
      const res = await fetch(
        `/api/workflow/${workflow.ID}`,
        {
          method: "PUT",
          body: JSON.stringify(workflow),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update workflow");
      }
      return res.json();
    },
    onSuccess: (_, workflow) => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflowDetails", workflow.ID] });
    },
    onError: (err) => toast(err.message || "Failed to update workflow."),
  });

  const deleteWorkflow = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/workflow/${workflowId}`,
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

  const bulkDeleteWorkflows = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(
        `/api/workflow/bulk/delete`,
        {
          method: "POST",
          body: JSON.stringify(ids),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete workflows");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  const bulkDuplicateWorkflows = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(
        `/api/workflow/bulk/duplicate`,
        {
          method: "POST",
          body: JSON.stringify(ids),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to duplicate workflows");
      }
      return (await res.json()) as BulkDuplicateResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    bulkDeleteWorkflows,
    bulkDuplicateWorkflows,
  };
}
