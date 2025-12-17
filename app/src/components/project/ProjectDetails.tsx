import { TableView } from "@/components/project/tableView/TableView";
import { EditableProjectName } from "@/components/project/EditableProjectName";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TaskFilters } from "./TaskFilters";
import { KhanbanView } from "./khanbanView/KhanbanView";
import { UpcomingView } from "./upcomingView/UpcomingView";

export function ProjectDetails({
  view,
  setView,
  projectId,
}: {
  view: string;
  setView: (view: string) => void;
  projectId: number;
}) {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const { SetProject, SetChecklists, SetTasks, Filter } =
    useContext(ProjectContext);
  const { isPending, data, isFetching, refetch } = useProjectDetailsQuery(
    projectId,
    Filter,
    !newTaskOpen,
  );

  useEffect(() => {
    if (data && !isPending && !isFetching) {
      SetTasks(data.Tasks);
      SetChecklists(data.Checklists);
      SetProject(data.Project);
    }
  }, [data, isFetching, isPending, SetProject, SetChecklists, SetTasks]);

  useEffect(() => {
    refetch();
  }, [refetch, Filter]);

  return (
    <>
      <div className="flex justify-between align-top overflow-hidden">
        <EditableProjectName />
      </div>

      <div className="flex flex-col gap-4 h-full overflow-hidden">
        <Tabs value={view} onValueChange={setView} className="h-full">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="khanban">Khanban</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TaskFilters setTaskDrawerOpen={setNewTaskOpen} />
          <TabsContent value="table" className="h-full overflow-hidden">
            <TableView />
          </TabsContent>
          <TabsContent value="khanban" className="h-full overflow-hidden">
            <KhanbanView />
          </TabsContent>
          <TabsContent value="upcoming" className="h-full overflow-hidden">
            <UpcomingView />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
