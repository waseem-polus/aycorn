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
import { useTaskMutation } from "@/queries/useTaskMutation";
import { Ellipsis, Maximize2 } from "lucide-react";
import { useContext } from "react";

export function TaskEditorHeader({
  setOpen = () => {},
}: {
  setOpen: (open: boolean) => void;
}) {
  const { state: task } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { deleteTask } = useTaskMutation(Project.ID);

  return (
    <DrawerHeader className="p-2 border-b">
      <div className="flex justify-end">
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
          >
            <Maximize2 className="size-3.5" />
          </Button>
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
                <DrawerClose asChild>
                  <DropdownMenuItem>Close</DropdownMenuItem>
                </DrawerClose>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    deleteTask.mutate(task.ID, {
                      onSuccess: () => setOpen(false),
                    });
                  }}
                  variant="destructive"
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DrawerHeader>
  );
}
