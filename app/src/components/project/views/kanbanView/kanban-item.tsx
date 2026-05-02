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

export function KanbanItem({ task }: { task: ChecklistTask }) {
  const { setNodeRef, style, listeners, attributes } = useDraggableItem(
    task.ID.toString(),
    { task },
  );
  const { toFormatted } = useDateFormat();

  return (
    <TaskProvider defaultState={task} key={task.ID}>
      <TaskEditorDrawer>
        <Item
          asChild
          className="border border-neutral-200 bg-background rounded-lg w-full box-border"
        >
          <a
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="overflow-clip"
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
                <ItemTitle className="text-neutral-400">New Task</ItemTitle>
              )}
            </ItemContent>

            <ItemFooter>
              <span className="w-full flex flex-col gap-1">
                <TaskTypeBadge variant={task.Type} />
                <Badge
                  variant={task.Assignee !== "" ? "secondary" : "outline"}
                  className={task.Assignee !== "" ? "" : "text-neutral-500"}
                >
                  <User className="size-2" />
                  {task.Assignee === "" ? "Not Assigned" : task.Assignee}
                </Badge>
                <Badge
                  variant={
                    task.TimePlannedStart !== null ? "secondary" : "outline"
                  }
                  className={
                    task.TimePlannedStart !== null ? "" : "text-neutral-500"
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
