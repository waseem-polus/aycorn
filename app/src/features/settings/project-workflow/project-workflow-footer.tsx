import { Link, useNavigate } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/types";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";
import { useProjectWorkflowMutation } from "@/features/settings/project-workflow/queries/useProjectWorkflowMutation";
import { Alert } from "@/components/ui/alert";

export function ProjectWorkflowFooter({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowMutation();
  const { switchWorkflow } = useProjectWorkflowMutation(project.ID);

  const busy = createWorkflow.isPending || switchWorkflow.isPending;

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (newId) => {
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(newId) },
          search: { new: true },
        });
      },
      onError: () => toast.error("Failed to create workflow."),
    });
  };

  return (
    <Alert className="bg-background mt-auto text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" />
      <span>
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
      </span>
    </Alert>
  );
}
