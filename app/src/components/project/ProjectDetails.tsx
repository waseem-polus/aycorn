import { TaskTable } from "@/components/project/TaskTable";
import { EditableProjectName } from "@/components/project/EditableProjectName";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { useContext, useEffect } from "react";
import {
  ProjectContext,
  type ProjectContextType,
} from "@/contexts/project/ProjectContext";

export function ProjectDetails({ projectId }: { projectId: string }) {
  const { SetProject, SetChecklists, SetTasks } = useContext(ProjectContext);

  useEffect(() => {
    fetch(`http://localhost:8000/api/project/${projectId}`)
      .then((res) => res.json())
      .then((res: ProjectContextType) => {
        const processedTasks = res.Tasks.map((task) => ({
          ...task,
          TimePlanned: task.TimePlanned ? new Date(task.TimePlanned) : null,
          TimeStarted: task.TimeStarted ? new Date(task.TimeStarted) : null,
          TimeCompleted: task.TimeCompleted
            ? new Date(task.TimeCompleted)
            : null,
        }));
        SetTasks(processedTasks);
        SetChecklists(res.Checklists);
        SetProject(res.Project);
      });
  }, [projectId, SetProject, SetChecklists, SetTasks]);

  return (
    <>
      <div className="flex justify-between">
        <EditableProjectName />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Pin</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TaskTable />
    </>
  );
}
