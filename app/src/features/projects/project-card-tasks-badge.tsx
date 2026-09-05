import { useState } from "react";
import { CopyCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { stageCalendarBadgeClass } from "@/features/stage/stage-palette";
import { useProjectCardStages } from "@/features/projects/hooks/useProjectCardStages";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/types";

export function ProjectCardTasksBadge({ project }: { project: Project }) {
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
          <CopyCheckIcon className="size-3" />
          {project.DoneTaskCount} / {project.TaskCount} Tasks
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-80 p-3 flex flex-col gap-2"
        // The content is portalled, but React events still bubble through the
        // component tree into the card's navigate-on-click handler.
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium">Tasks</span>

        {isPending || !data ? (
          <Skeleton className="h-6 w-full rounded-md" />
        ) : (
          <SegmentedProgress
            variant="labeled"
            segments={data.Stages.map((stage) => ({
              count: stage.TaskCount,
              className: cn(stageCalendarBadgeClass(stage.Color), "border"),
              label: stage.Name,
            }))}
            className="h-6 rounded-none gap-1"
          />
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
