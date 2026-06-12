import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { useIsMobile } from "@/hooks/useMobile";
import { useTaskMutation } from "@/queries/useTaskMutation";
import {
  ChevronsRightIcon,
  ClipboardIcon,
  CopyCheckIcon,
  Ellipsis,
  Maximize2,
  PinIcon,
  Trash2Icon,
} from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "../properties/task-type-badge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { priorityOutlineBadgeClass } from "../properties/task-priority-palette";

export function TaskEditorHeader({
  setOpen = () => {},
  onCopyAsMarkdown,
  onCopyAsPlainText,
  isEditorReady = false,
}: {
  setOpen: (open: boolean) => void;
  onCopyAsMarkdown?: () => void;
  onCopyAsPlainText?: () => void;
  isEditorReady?: boolean;
}) {
  const { state: task } = useContext(TaskContext);
  const { Project, Stages } = useContext(ProjectContext);
  const { deleteTask } = useTaskMutation(Project.ID);
  const navigate = useNavigate();

  const isMobile = useIsMobile();

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
              className="text-muted-foreground"
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

          <Separator orientation="vertical" className="mx-3" />

          <RelativeTimeWithTooltip
            date={task.TimeModified}
            label="Modified"
            className="hidden sm:flex"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Badge
            variant="outline"
            className={priorityOutlineBadgeClass(task.Priority)}
          >
            <TaskPriorityIcon variant={task.Priority} />
            {task.Priority}
          </Badge>
          <TaskTypeBadge type={task.Type} />
          {Stages.find((s) => s.ID === task.Stage) && (
            <WorkflowStageChip
              className="rounded-full"
              stage={Stages.find((s) => s.ID === task.Stage)!}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 data-[state=open]:bg-muted text-muted-foreground flex"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-2">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <PinIcon className="text-muted-foreground" />
                  Pin
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyCheckIcon className="text-muted-foreground" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ClipboardIcon className="text-muted-foreground" />
                    Copy as
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      disabled={!isEditorReady}
                      onClick={onCopyAsMarkdown}
                    >
                      Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopyAsPlainText}>
                      Plain text
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DrawerClose asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      const taskName =
                        task.Name === "" ? "New Task" : task.Name;
                      deleteTask.mutate(task.ID, {
                        onSuccess: () => toast(`Deleted '${taskName}'`),
                        onError: () => {
                          toast(`Failed deleting '${taskName}'`);
                          setOpen(true);
                        },
                      });
                    }}
                    variant="destructive"
                  >
                    <Trash2Icon className="text-muted-foreground" />
                    Delete
                  </DropdownMenuItem>
                </DrawerClose>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DrawerHeader>
  );
}
