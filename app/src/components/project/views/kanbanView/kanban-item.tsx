import { Badge } from "@/components/ui/badge";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { CalendarIcon, LandPlot, User } from "lucide-react";
import type { ChecklistTask } from "@/types/types";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { useDraggableItem } from "@/hooks/useDraggableItem";
import { cn } from "@/lib/utils";

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

export function KanbanItem({
  task,
  getItemProps,
}: {
  task: ChecklistTask;
  getItemProps?: (
    id: string,
    opts?: { listeners?: DragListeners },
  ) => Record<string, unknown>;
}) {
  const { setNodeRef, style, listeners, attributes } = useDraggableItem(
    task.ID.toString(),
    { task },
  );
  const { toFormatted } = useDateFormat();

  const itemProps = getItemProps?.(task.ID.toString(), {
    listeners: listeners as DragListeners | undefined,
  });
  const itemClassName = (itemProps?.className as string | undefined) ?? "";

  return (
    <TaskProvider defaultState={task} key={task.ID}>
      <TaskEditorDrawer>
        <Item
          asChild
          className="border border-border bg-background rounded-lg w-full box-border"
        >
          <a
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...itemProps}
            data-task-card=""
            className={cn(
              "overflow-clip data-selected:bg-accent data-selected:ring-2 data-selected:ring-primary",
              itemClassName,
            )}
          >
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
                <ItemTitle className="text-muted-foreground">
                  New Task
                </ItemTitle>
              )}
            </ItemContent>

            <ItemFooter>
              <span className="w-full flex flex-col gap-1">
                <TaskTypeBadge variant={task.Type} />
                <Badge
                  variant={task.Assignee !== "" ? "secondary" : "outline"}
                  className={
                    task.Assignee !== "" ? "" : "text-muted-foreground"
                  }
                >
                  <User className="size-2" />
                  {task.Assignee === "" ? "Not Assigned" : task.Assignee}
                </Badge>
                <Badge
                  variant={
                    task.TimePlannedStart !== null ? "secondary" : "outline"
                  }
                  className={
                    task.TimePlannedStart !== null
                      ? ""
                      : "text-muted-foreground"
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
            </ItemFooter>
          </a>
        </Item>
      </TaskEditorDrawer>
    </TaskProvider>
  );
}
