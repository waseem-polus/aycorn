import { useState } from "react";
import { WorkflowIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { useProjectCardStages } from "@/features/projects/hooks/useProjectCardStages";
import type { Project } from "@/types/types";

export function ProjectCardWorkflowBadge({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { isPending, data } = useProjectCardStages(project.ID, open);

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={200}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          tabIndex={0}
          className="stroke-muted-foreground text-muted-foreground"
        >
          <WorkflowIcon className="size-3" />
          {project.WorkflowName}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-64 p-3 flex flex-col gap-2"
        // The content is portalled, but React events still bubble through the
        // component tree into the card's navigate-on-click handler.
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium">{project.WorkflowName}</span>

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
            {data.Workflow.Description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.Workflow.Description}
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
