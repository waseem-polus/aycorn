import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerHeader } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useIsMobile } from "@/hooks/useMobile";
import { useTaskMutation } from "@/queries/useTaskMutation";
import {
  ChevronsRightIcon,
  Ellipsis,
  LandPlotIcon,
  Maximize2,
} from "lucide-react";
import { useContext } from "react";
import { toast } from "sonner";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "../properties/task-type-badge";
import { Badge } from "@/components/ui/badge";

export function TaskEditorHeader({
  setOpen = () => {},
}: {
  setOpen: (open: boolean) => void;
}) {
  const { state: task } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { deleteTask } = useTaskMutation(Project.ID);

  const isMobile = useIsMobile();

  return (
    <DrawerHeader className="p-2 sm:border-b">
      <div className="flex justify-between">
        <div className="flex">
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
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <RelativeTimeWithTooltip
            date={task.TimeModified}
            label="Modified"
            className="invisible sm:visible"
          />
          <TaskPriorityIcon variant={task.Priority} />
          <TaskTypeBadge variant={task.Type} />
          <Badge variant="outline" className="text-muted-foreground">
            <LandPlotIcon className="size-2" />
            {task.ChecklistName}
          </Badge>
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
                <DropdownMenuItem>Add Favorite</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
                    Delete Task
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
