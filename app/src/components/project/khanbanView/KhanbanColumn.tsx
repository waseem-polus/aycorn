import TaskPriorityIcon from "@/components/task/taskDrawer/icons/TaskPriorityIcon";
import TaskStatusIcon from "@/components/task/taskDrawer/icons/TaskStatusIcon";
import TaskTypeBadge from "@/components/task/taskDrawer/TaskTypeBadge";
import TaskSideDrawer from "@/components/task/TaskSideDrawer";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import type { Task } from "@/types/types";
import { CalendarIcon, ChevronRightIcon, LandPlot, User } from "lucide-react";
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
        return task.Name.toLowerCase().includes(search.toLowerCase());
      }),
    [search, Tasks],
  );

  return (
    <ItemGroup className="border rounded w-1/5 overflow-hidden p-1 flex flex-col gap-1">
      <div className="p-1">
        <span className="flex items-center gap-2">
          <TaskStatusIcon variant={status} />
          {status}
        </span>
        <span className="text-neutral-500 text-sm">{description}</span>
      </div>

      {filteredTasks.map((task) => {
        if (task.Status !== status) {
          return;
        }

        return (
          <TaskProvider defaultState={task} key={task.ID}>
            <TaskSideDrawer>
              <Item
                asChild
                className="border border-neutral-200 rounded-lg w-full box-border"
              >
                <a>
                  <ItemMedia className="flex flex-col">
                    <TaskPriorityIcon variant={task.Priority} />
                  </ItemMedia>
                  <ItemContent>
                    {task.Name !== "" ? (
                      <ItemTitle>{task.Name}</ItemTitle>
                    ) : (
                      <ItemTitle className="text-neutral-400">
                        New Task
                      </ItemTitle>
                    )}

                    <ItemDescription>
                      <span className="w-full flex gap-2">
                        <Badge
                          variant={
                            task.Assignee !== "" ? "secondary" : "outline"
                          }
                          className={
                            task.Assignee !== "" ? "" : "text-neutral-500"
                          }
                        >
                          <User className="size-2" />
                          {task.Assignee === ""
                            ? "Not Assigned"
                            : task.Assignee}
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
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="w-full flex justify-end gap-2">
                      <TaskTypeBadge variant={task.Type} />
                      <Badge variant="outline">
                        <LandPlot className="size-2" />
                        {task.ChecklistName}
                      </Badge>
                    </span>
                    <ChevronRightIcon className="size-4" />
                  </ItemActions>
                </a>
              </Item>
            </TaskSideDrawer>
          </TaskProvider>
        );
      })}
    </ItemGroup>
  );
}
