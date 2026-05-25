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
import { ChevronRightIcon, LandPlot, User } from "lucide-react";
import React, { useContext } from "react";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { StageIcon } from "@/features/stage/stage-visual";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import { TaskPlannedDates } from "@/features/task/properties/task-planned-dates";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ViewHeader } from "../view-header";
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

export function ListView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Tasks, Stages } = useContext(ProjectContext);
  const stagesById = React.useMemo(
    () => new Map(Stages.map((s) => [s.ID, s])),
    [Stages],
  );
  const { getItemProps } = useSharedSelection();

  return (
    <div className="h-full box-border flex flex-col gap-2 overflow-visible">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <div className="h-full min-h-0 overflow-auto">
        <ItemGroup className="h-fit box-border rounded-md overflow-visible p-1">
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
                          className={cn(itemClassName, selectedItemClasses())}
                        >
                          <ItemMedia className="flex flex-col">
                            <StageIcon stage={stagesById.get(task.Stage)} />
                            <TaskPriorityIcon variant={task.Priority} />
                          </ItemMedia>
                          <ItemContent className="flex-1 min-w-0 overflow-visible">
                            <ListViewTaskName />

                            <ItemDescription>
                              <span className="w-full h-full flex flex-wrap gap-2">
                                <TaskTypeBadge
                                  className="flex sm:hidden"
                                  variant={task.Type}
                                />

                                <Badge
                                  variant={
                                    task.Assignee !== ""
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    task.Assignee !== ""
                                      ? ""
                                      : "bg-background text-muted-foreground"
                                  }
                                >
                                  <User className="size-2" />
                                  {task.Assignee === ""
                                    ? "Not Assigned"
                                    : task.Assignee}
                                </Badge>

                                <TaskPlannedDates
                                  className="hidden sm:flex"
                                  start={task.TimePlannedStart}
                                  end={task.TimePlannedEnd}
                                  hasStartTime={task.HasTimePlannedStart}
                                  hasEndTime={task.HasTimePlannedEnd}
                                />

                                <Badge
                                  variant="outline"
                                  className="bg-background flex sm:hidden"
                                >
                                  <LandPlot className="size-2" />
                                  {task.ChecklistName !== ""
                                    ? task.ChecklistName
                                    : "New Checklist"}
                                </Badge>
                              </span>
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <span className="hidden sm:flex w-full justify-end gap-2">
                              <TaskTypeBadge variant={task.Type} />
                              <Badge
                                variant="outline"
                                className="bg-background"
                              >
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
