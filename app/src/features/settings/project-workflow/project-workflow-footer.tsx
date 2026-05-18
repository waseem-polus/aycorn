import { Link, useNavigate } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/types";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";
import { useProjectWorkflowMutation } from "@/features/settings/project-workflow/queries/useProjectWorkflowMutation";

export function ProjectWorkflowFooter({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowMutation();
  const { setWorkflow } = useProjectWorkflowMutation(project.ID);

  const busy = createWorkflow.isPending || setWorkflow.isPending;

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (newId) => {
        setWorkflow.mutate(
          { ...project, Workflow: newId },
          {
            onSuccess: () =>
              navigate({
                to: "/workflow/$workflowId",
                params: { workflowId: String(newId) },
                search: { new: true },
              }),
            onError: () => toast.error("Failed to update project workflow."),
          },
        );
      },
      onError: () => toast.error("Failed to create workflow."),
    });
  };

  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" />
      Need a different shape?{" "}
      <Link to="/workflows" className="text-primary hover:underline">
        Browse all workflows
      </Link>{" "}
      or{" "}
      <button
        type="button"
        onClick={handleCreate}
        disabled={busy}
        className="text-primary hover:underline disabled:opacity-50"
      >
        create a new one
      </button>
      .
    </p>
  );
}
