import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";

/** Creates an empty workflow and opens it with its name focused for editing. */
export const useCreateWorkflow = () => {
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowMutation();

  const create = () =>
    createWorkflow.mutate(undefined, {
      onSuccess: (newId) =>
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(newId) },
          search: { new: true },
        }),
      onError: () => toast.error("Failed to create workflow."),
    });

  return { create, isPending: createWorkflow.isPending };
};
