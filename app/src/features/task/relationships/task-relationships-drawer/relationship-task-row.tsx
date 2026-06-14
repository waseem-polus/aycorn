import type { RelatedTask } from "@/types/types";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RelationshipTaskRow({ task }: { task: RelatedTask }) {
  const subtitle = `${task.ProjectName} · ${task.ChecklistName}`;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0">
      <TaskPriorityIcon variant={task.Priority} className="shrink-0" />

      {/* Name + project · checklist */}
      <span className="flex flex-col min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="self-start max-w-full truncate text-sm font-medium">
              {task.Name || "Untitled"}
            </span>
          </TooltipTrigger>
          {task.Name && <TooltipContent>{task.Name}</TooltipContent>}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="self-start max-w-full truncate text-xs text-muted-foreground">
              {subtitle}
            </span>
          </TooltipTrigger>
          <TooltipContent>{subtitle}</TooltipContent>
        </Tooltip>
      </span>

      {/* Stage chip */}
      <span className="shrink-0">
        <WorkflowStageChip stage={task.Stage} className="text-xs" />
      </span>

      {/* Type badge */}
      <span className="shrink-0">
        <TaskTypeBadge type={task.Type} />
      </span>
    </div>
  );
}
