import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TaskActionsMenu } from "@/features/task/header/task-actions-menu";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { useIsMobile } from "@/hooks/useMobile";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ChevronsRightIcon, Maximize2 } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Stage } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { priorityOutlineBadgeClass } from "../properties/task-priority-palette";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import { cn } from "@/lib/utils";
import TaskTypeBadge from "../properties/task-type-badge";

export function TaskEditorHeader({
  setOpen = () => {},
  onCopyAsMarkdown,
  onCopyAsPlainText,
  taskStage,
  isEditorReady = false,
}: {
  setOpen: (open: boolean) => void;
  onCopyAsMarkdown?: () => void;
  onCopyAsPlainText?: () => void;
  taskStage: Stage;
  isEditorReady?: boolean;
}) {
  const { state: task } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { deleteTask } = useTaskMutation(Project.ID);
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  const handleDelete = () => {
    const taskName = task.Name === "" ? "Untitled Task" : task.Name;
    setOpen(false);
    deleteTask.mutate(task.ID, {
      onSuccess: () => toast(`Deleted '${taskName}'`),
      onError: () => {
        toast(`Failed deleting '${taskName}'`);
        setOpen(true);
      },
    });
  };

  return (
    <DrawerHeader className="p-2 sm:border-b">
      <DrawerTitle hidden>{task.Name}</DrawerTitle>
      <DrawerDescription hidden>
        Task editor for task "{task.Name}"
      </DrawerDescription>
      <div className="flex justify-between">
        <div className="flex items-center">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hidden sm:flex"
            >
              <ChevronsRightIcon className={isMobile ? "rotate-90" : ""} />
            </Button>
          </DrawerClose>

          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={() => {
              setOpen(false);
              navigate({
                to: "/task/$taskId",
                params: { taskId: String(task.ID) },
              });
            }}
          >
            <Maximize2 className="size-3.5" />
          </Button>

          <RelativeTimeWithTooltip
            date={task.TimeModified}
            label="Modified"
            className="hidden sm:flex text-xs ml-1"
          />
        </div>

        <div className="flex gap-1 sm:gap-2 items-center">
          <Badge
            variant="outline"
            className={cn(
              "sm:hidden",
              priorityOutlineBadgeClass(task.Priority),
            )}
          >
            <TaskPriorityIcon variant={task.Priority} />
            {task.Priority}
          </Badge>
          <TaskTypeBadge type={task.Type} />
          {taskStage && (
            <WorkflowStageChip className="rounded-full" stage={taskStage} />
          )}
          <TaskActionsMenu
            task={task}
            projectId={Project.ID}
            onDelete={handleDelete}
            onCopyAsMarkdown={onCopyAsMarkdown}
            onCopyAsPlainText={onCopyAsPlainText}
            isEditorReady={isEditorReady}
            onMoved={() => setOpen(false)}
            triggerClassName="size-7 flex"
          />
        </div>
      </div>
    </DrawerHeader>
  );
}
