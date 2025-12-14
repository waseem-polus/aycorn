import { TableView } from "@/components/project/tableView/TableView";
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
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import type { Task } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TaskFilters } from "./TaskFilters";
import { KhanbanView } from "./khanbanView/KhanbanView";

export function ProjectDetails({
  view,
  setView,
  projectId,
}: {
  view: string;
  setView: (view: string) => void;
  projectId: number;
}) {
  const { SetProject, SetChecklists, SetTasks } = useContext(ProjectContext);
  const { isPending, data, isFetching } = useProjectDetailsQuery(projectId);

  useEffect(() => {
    if (data && !isPending && !isFetching) {
      const processedTasks = data.Tasks.map((task: Task) => ({
        ...task,
        TimePlanned: task.TimePlanned ? new Date(task.TimePlanned) : null,
        TimeStarted: task.TimeCreated ? new Date(task.TimeCreated) : null,
        TimeCompleted: task.TimeCompleted ? new Date(task.TimeCompleted) : null,
      }));
      SetTasks(processedTasks);
      SetChecklists(data.Checklists);
      SetProject(data.Project);
    }
  }, [data, isFetching, isPending, SetProject, SetChecklists, SetTasks]);

  return (
    <>
      <div className="flex justify-between align-top overflow-hidden">
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

      <div className="flex flex-col gap-4 h-full overflow-hidden">
        <Tabs value={view} onValueChange={setView} className="h-full">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="khanban">Khanban</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TaskFilters />
          <TabsContent className="h-full overflow-hidden" value="table">
            <TableView />
          </TabsContent>
          <TabsContent
            id="wazm"
            className="h-full overflow-hidden"
            value="khanban"
          >
            <KhanbanView />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
