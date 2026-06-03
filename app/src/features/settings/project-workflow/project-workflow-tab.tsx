import { useNavigate } from "@tanstack/react-router";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectWorkflowSettingsQuery } from "@/features/settings/project-workflow/queries/useProjectWorkflowSettingsQuery";
import { ProjectWorkflowCard } from "@/features/settings/project-workflow/project-workflow-card";
import { ProjectWorkflowFooter } from "@/features/settings/project-workflow/project-workflow-footer";
import { SwitchWorkflowButton } from "@/features/settings/project-workflow/switch-workflow-button";

export function ProjectWorkflowTab({ projectId }: { projectId: number }) {
  const navigate = useNavigate();
  const { data, isFetching } = useProjectWorkflowSettingsQuery(projectId);

  if (!data?.Workflow) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        {isFetching ? "Loading workflow..." : "Workflow not found."}
      </div>
    );
  }

  const goToWorkflow = () =>
    navigate({
      to: "/workflow/$workflowId",
      params: { workflowId: String(data.Workflow.ID) },
    });

  const workflowButton = (
    <>
      <Button
        className="flex-1 sm:flex-none"
        variant="outline"
        onClick={goToWorkflow}
      >
        <SquarePen />
        Edit workflow
      </Button>
      <SwitchWorkflowButton
        projectId={projectId}
        currentWorkflowId={data.Workflow.ID}
        currentWorkflowName={data.Workflow.Name}
        currentStages={data.Stages}
      />
    </>
  );

  return (
    <section className="flex flex-col gap-5 md:gap-3 h-full">
      <div className="flex items-start justify-between ">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Project workflow</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Tasks in this project move through the stages defined by this
            workflow. Switching workflows requires routing every task to a new
            stage.
          </p>
        </div>
        <div className="shrink-0 items-center gap-2 hidden md:flex">
          {workflowButton}
        </div>
      </div>

      <ProjectWorkflowCard workflow={data.Workflow} stages={data.Stages} />
      <div className="flex justify-end gap-2 w-full md:hidden">
        {workflowButton}
      </div>
      <ProjectWorkflowFooter project={data.Project} />
    </section>
  );
}
