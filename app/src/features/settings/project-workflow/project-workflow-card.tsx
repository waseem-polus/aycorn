import { useNavigate } from "@tanstack/react-router";
import { Workflow as WorkflowIcon } from "lucide-react";
import type { Stage, Workflow } from "@/types/types";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";

export function ProjectWorkflowCard({
  workflow,
  stages,
}: {
  workflow: Workflow;
  stages: Stage[];
}) {
  const navigate = useNavigate();

  const taskCount = stages.reduce((sum, stage) => sum + stage.TaskCount, 0);
  const meta = [
    workflow.Description,
    `${stages.length} stage${stages.length !== 1 ? "s" : ""}`,
    `${taskCount} task${taskCount !== 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const goToWorkflow = () =>
    navigate({
      to: "/workflow/$workflowId",
      params: { workflowId: String(workflow.ID) },
    });

  return (
    <Card className="gap-3 rounded-lg p-4 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={goToWorkflow}
            className="flex items-center gap-2 text-left font-medium hover:underline"
          >
            <WorkflowIcon className="size-4 shrink-0" />
            <span className="truncate">
              {workflow.Name === "" ? "Untitled Workflow" : workflow.Name}
            </span>
          </button>
          <p className="text-sm text-muted-foreground">{meta}</p>
        </div>
        <RelativeTimeWithTooltip
          className="hidden sm:flex"
          date={workflow.TimeModified}
          label="Last modified"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {stages.map((stage) =>
          stage.Description ? (
            <Tooltip key={stage.ID}>
              <TooltipTrigger asChild>
                <span>
                  <WorkflowStageChip stage={stage} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{stage.Description}</TooltipContent>
            </Tooltip>
          ) : (
            <WorkflowStageChip key={stage.ID} stage={stage} />
          ),
        )}
      </div>
    </Card>
  );
}
