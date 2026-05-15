import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflowDetailsQuery } from "@/features/workflows/shared/queries/useWorkflowDetailsQuery";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";

type WorkflowCellProps = {
  workflowId: number;
  workflowName: string;
};

export function WorkflowCell({ workflowId, workflowName }: WorkflowCellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data, isPending } = useWorkflowDetailsQuery(workflowId, { enabled: open });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: "/workflow/$workflowId", params: { workflowId: String(workflowId) } });
  };

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={handleClick}
          className="w-full truncate cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors text-left"
        >
          {workflowName}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-64 p-3 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium">{workflowName}</span>

        {isPending || !data ? (
          <>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex flex-wrap gap-1 mt-1">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </>
        ) : (
          <>
            {data.Description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.Description}
              </p>
            )}
            {data.Stages.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.Stages.map((stage) => (
                  <WorkflowStageChip key={stage.ID} stage={stage} />
                ))}
              </div>
            )}
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
