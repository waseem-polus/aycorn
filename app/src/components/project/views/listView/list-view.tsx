import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
} from "@/components/ui/item";
import { ListViewTaskName } from "./list-view/list-view-task-name";
import {
  Calendar as CalendarIcon,
  ChevronRightIcon,
  LandPlot,
  User,
} from "lucide-react";
import React, { useContext } from "react";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import TaskStatusIcon from "@/features/task/properties/icons/TaskStatusIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { ViewHeader } from "../view-header";
import { useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

export function ListView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks } = useContext(ProjectContext);
  const { toFormatted } = useDateFormat();
  const { getItemProps } = useSharedSelection();

  return (
    <div className="h-full box-border flex flex-col gap-2 overflow-visible">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <div className="h-full min-h-0 overflow-auto">
        <ItemGroup className="h-fit box-border rounded-md overflow-visible">
          {Tasks.length > 0 ? (
            Tasks.map((task, i) => {
              const itemProps = getItemProps(task.ID.toString());
              const itemClassName =
                (itemProps.className as string | undefined) ?? "";
              return (
                <React.Fragment key={task.ID}>
                  <TaskProvider defaultState={task}>
                    <TaskEditorDrawer>
                      <Item asChild>
                        <a
                          {...itemProps}
                          data-task-card=""
                          className={cn(
                            "data-selected:bg-accent data-selected:ring-2 data-selected:ring-primary data-selected:ring-inset",
                            itemClassName,
                          )}
                        >
                          <ItemMedia className="flex flex-col">
                            <TaskStatusIcon variant={task.Status} />
                            <TaskPriorityIcon variant={task.Priority} />
                          </ItemMedia>
                          <ItemContent>
                            <ListViewTaskName />

                            <ItemDescription>
                              <span className="w-full flex gap-2">
                                <Badge
                                  variant={
                                    task.Assignee !== ""
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    task.Assignee !== ""
                                      ? ""
                                      : "text-neutral-500"
                                  }
                                >
                                  <User className="size-2" />
                                  {task.Assignee === ""
                                    ? "Not Assigned"
                                    : task.Assignee}
                                </Badge>
                                <Badge
                                  variant={
                                    task.TimePlannedStart !== null
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    task.TimePlannedStart !== null
                                      ? ""
                                      : "text-neutral-500"
                                  }
                                >
                                  <CalendarIcon className="size-2" />
                                  {task.TimePlannedStart !== null
                                    ? toFormatted(task.TimePlannedStart)
                                    : "Not Scheduled"}

                                  {task.TimePlannedEnd !== null &&
                                    " → " + toFormatted(task.TimePlannedEnd)}
                                </Badge>
                              </span>
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <span className="w-full flex justify-end gap-2">
                              <TaskTypeBadge variant={task.Type} />
                              <Badge variant="outline">
                                <LandPlot className="size-2" />
                                {task.ChecklistName !== ""
                                  ? task.ChecklistName
                                  : "New Checklist"}
                              </Badge>
                            </span>
                            <ChevronRightIcon className="size-4" />
                          </ItemActions>
                        </a>
                      </Item>
                    </TaskEditorDrawer>
                  </TaskProvider>

                  {Tasks.length - 1 != i && <ItemSeparator />}
                </React.Fragment>
              );
            })
          ) : (
            <Empty>
              <EmptyDescription>No Tasks Found</EmptyDescription>
            </Empty>
          )}
        </ItemGroup>
      </div>
    </div>
  );
}
