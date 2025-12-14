import TaskPriorityIcon from "@/components/task/taskDrawer/icons/TaskPriorityIcon";
import TaskStatusIcon from "@/components/task/taskDrawer/icons/TaskStatusIcon";
import TaskTypeBadge from "@/components/task/taskDrawer/TaskTypeBadge";
import TaskSideDrawer from "@/components/task/TaskSideDrawer";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import type { Task } from "@/types/types";
import { CalendarIcon, LandPlot, User } from "lucide-react";
import { useContext, useMemo, useState } from "react";

export function KhanbanColumn({
  status,
  description,
}: {
  status: Task["Status"];
  description: string;
}) {
  const { Tasks } = useContext(ProjectContext);
  const [search, setSearch] = useState("");
  const filteredTasks = useMemo(
    () =>
      Tasks.filter((task) => {
        return (
          task.Name.toLowerCase().includes(search.toLowerCase()) &&
          task.Status === status
        );
      }),
    [search, Tasks, status],
  );

  return (
    <div className="w-1/5 overflow-hidden flex flex-col gap-2 p-1 h-full">
      <div className="mb-1">
        <span className="flex items-center gap-2">
          <TaskStatusIcon variant={status} />
          {status}
          <Badge variant="outline" className="size-5">
            {filteredTasks.length}
          </Badge>
        </span>
        <span className="text-neutral-500 text-sm">{description}</span>
      </div>
      <ItemGroup className="h-full overflow-y-scroll flex flex-col gap-2 pr-2">
        {filteredTasks.map((task) => (
          <TaskProvider defaultState={task} key={task.ID}>
            <TaskSideDrawer>
              <Item
                asChild
                className="border border-neutral-200 rounded-lg w-full box-border"
              >
                <a>
                  <ItemHeader className="flex justify-between">
                    <TaskPriorityIcon variant={task.Priority} />
                    <Badge variant="outline">
                      <LandPlot className="size-2" />
                      {task.ChecklistName}
                    </Badge>
                  </ItemHeader>
                  <ItemContent>
                    {task.Name !== "" ? (
                      <ItemTitle>{task.Name}</ItemTitle>
                    ) : (
                      <ItemTitle className="text-neutral-400">
                        New Task
                      </ItemTitle>
                    )}
                  </ItemContent>

                  <ItemFooter>
                    <span className="w-full flex flex-col gap-2">
                      <TaskTypeBadge variant={task.Type} />
                      <Badge
                        variant={task.Assignee !== "" ? "secondary" : "outline"}
                        className={
                          task.Assignee !== "" ? "" : "text-neutral-500"
                        }
                      >
                        <User className="size-2" />
                        {task.Assignee === "" ? "Not Assigned" : task.Assignee}
                      </Badge>
                      <Badge
                        variant={
                          task.TimePlanned !== null ? "secondary" : "outline"
                        }
                        className={
                          task.TimePlanned !== null ? "" : "text-neutral-500"
                        }
                      >
                        <CalendarIcon className="size-2" />
                        {task.TimePlanned !== null
                          ? new Date(task.TimePlanned).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "Not Scheduled"}
                      </Badge>
                    </span>
                  </ItemFooter>
                </a>
              </Item>
            </TaskSideDrawer>
          </TaskProvider>
        ))}
      </ItemGroup>
    </div>
  );
}
