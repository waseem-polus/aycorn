import type { RelatedTask } from "@/types/types";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteTaskRelationshipMutation } from "@/features/task/relationships/queries/useDeleteTaskRelationshipMutation";
import { Link } from "@tanstack/react-router";

export function RelationshipTaskRow({
  task,
  relationshipId,
}: {
  task: RelatedTask;
  relationshipId: number;
}) {
  const deleteRelationship = useDeleteTaskRelationshipMutation();

  return (
    <Link to="/task/$taskId"
        params={{ taskId: task.ID.toString() }}
        className="group flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-accent"
    >
        <TaskPriorityIcon variant={task.Priority} className="shrink-0" />

      <span className="flex flex-col min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="self-start max-w-full truncate text-sm font-medium">
              {task.Name || "Untitled Task"}
            </span>
          </TooltipTrigger>
          {task.Name && <TooltipContent>{task.Name}</TooltipContent>}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
                to="/project/$projectId"
                params={{ projectId: task.ProjectID.toString() }}
                className="self-start max-w-full truncate text-xs text-muted-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                {task.ProjectName} · {task.ChecklistName}
            </Link>
          </TooltipTrigger>
            <TooltipContent>
                {task.ProjectName} · {task.ChecklistName}
          </TooltipContent>
        </Tooltip>
      </span>

      <span className="shrink-0">
        <WorkflowStageChip stage={task.Stage} className="text-xs" />
      </span>

      <span className="shrink-0">
        <TaskTypeBadge type={task.Type} />
      </span>

        <Button
            variant="ghost"
            size="icon"
            className="shrink-0 size-6 text-muted-foreground hover:text-foreground hover:cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteRelationship.mutate(relationshipId)
            }}
        >
        <XIcon className="size-3.5" />
      </Button>
    </Link>
  );
}
