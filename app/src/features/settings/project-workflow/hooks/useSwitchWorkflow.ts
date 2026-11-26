import { useState } from "react";
import { toast } from "sonner";
import { useProjectWorkflowMutation } from "@/features/settings/project-workflow/queries/useProjectWorkflowMutation";
import type { Stage } from "@/types/types";

type WorkflowChoice = { ID: number; Name: string };

/**
 * Switching a project to another workflow. With no tasks it switches at once;
 * otherwise it sets `target`, and the caller renders `SwitchWorkflowDialog`
 * so every task can be routed to a stage in the new workflow.
 */
export const useSwitchWorkflow = ({
  projectId,
  currentWorkflowId,
  currentStages,
}: {
  projectId: number;
  currentWorkflowId: number;
  currentStages: Stage[];
}) => {
  const [target, setTarget] = useState<WorkflowChoice | null>(null);
  const { switchWorkflow } = useProjectWorkflowMutation(projectId);
  const hasTasks = currentStages.some((s) => s.TaskCount > 0);

  const selectWorkflow = (workflow: WorkflowChoice) => {
    if (workflow.ID === currentWorkflowId) return;
    if (hasTasks) {
      setTarget(workflow);
      return;
    }
    switchWorkflow.mutate(
      { workflowId: workflow.ID, stageMappings: {} },
      {
        onSuccess: () => toast.success(`Switched to ${workflow.Name}.`),
        onError: (err) =>
          toast.error(err.message || "Failed to switch workflow."),
      },
    );
  };

  return {
    selectWorkflow,
    target,
    closeDialog: () => setTarget(null),
    isPending: switchWorkflow.isPending,
  };
};
