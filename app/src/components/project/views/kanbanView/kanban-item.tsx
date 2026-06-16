import { Badge } from "@/components/ui/badge";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { TaskPlannedDates } from "@/features/task/properties/task-planned-dates";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { GripVertical, LandPlot, User } from "lucide-react";
import { UnresolvedBlockersBadge } from "@/features/task/relationships/unresolved-blockers-badge";
import type { ChecklistTask } from "@/types/types";
import { useDraggableItem } from "@/hooks/useDraggableItem";
import { selectedItemClasses } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { SubtaskProgressBar } from "@/features/task/relationships/subtask-progress-bar";
import { useSubtaskProgress } from "@/features/task/relationships/queries/useSubtaskProgress";

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

export function KanbanItem({
  task,
  getItemProps,
  animClass,
}: {
  task: ChecklistTask;
  getItemProps?: (
    id: string,
    opts?: { listeners?: DragListeners },
  ) => Record<string, unknown>;
  animClass?: string;
}) {
  const { setNodeRef, style, listeners, attributes } = useDraggableItem(
    task.ID.toString(),
    { task },
  );

  // Split listeners by sensor: onPointerDown (PointerSensor) stays on the card for
  // desktop whole-card drag; onTouchStart (TouchSensor) goes to the mobile handle
  // which has touch-action:none so the browser won't intercept it for scrolling.
  const { onTouchStart, ...pointerListeners } = (listeners ?? {}) as {
    onTouchStart?: React.TouchEventHandler;
  } & DragListeners;

  const itemProps = getItemProps?.(task.ID.toString(), {
    listeners: pointerListeners as DragListeners | undefined,
  });
  const itemClassName = (itemProps?.className as string | undefined) ?? "";

  const { Checklists } = useContext(ProjectContext);

  const subtaskProgress = useSubtaskProgress(task.ID);

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
              "overflow-clip select-none",
              selectedItemClasses(),
              itemClassName,
              animClass,
            )}
          >
            <ItemHeader className="flex justify-between items-center gap-1">
              <div className="flex flex-1 gap-2 justify-between items-center min-w-0">
                <TaskPriorityIcon variant={task.Priority} />
                <TaskTypeBadge type={task.Type} />
              </div>
              <button
                type="button"
                data-drag-handle=""
                aria-label="Drag to reorder"
                onTouchStart={onTouchStart}
                style={{ touchAction: "none" }}
                className="hidden pointer-coarse:flex cursor-grab active:cursor-grabbing text-muted-foreground -mr-1"
              >
                <GripVertical className="size-4" />
              </button>
            </ItemHeader>
            <ItemContent className="flex flex-col gap-4">
              <ItemTitle
                className={task.Name === "" ? "text-muted-foreground" : ""}
              >
                {task.Name !== "" ? task.Name : "Untitled Task"}
              </ItemTitle>

              <span className="w-full flex flex-col gap-1">
                {Checklists.length > 1 && (
                  <Badge variant="outline">
                    <LandPlot className="size-2" />
                    {task.ChecklistName}
                  </Badge>
                )}
                <Badge
                  variant={task.Assignee !== "" ? "secondary" : "outline"}
                  className={
                    task.Assignee !== "" ? "" : "text-muted-foreground"
                  }
                >
                  <User className="size-2" />
                  {task.Assignee === "" ? "Not Assigned" : task.Assignee}
                </Badge>
                <TaskPlannedDates
                  start={task.TimePlannedStart}
                  end={task.TimePlannedStart}
                  hasStartTime={task.HasTimePlannedStart}
                  hasEndTime={false}
                  excludeYear
                />

                <UnresolvedBlockersBadge taskId={task.ID} />
              </span>
            </ItemContent>

            {subtaskProgress && (
                <ItemFooter>
                    <SubtaskProgressBar done={subtaskProgress.done} total={subtaskProgress.total} />
                </ItemFooter>
            )}
          </a>
        </Item>
      </TaskEditorDrawer>
    </TaskProvider>
  );
}
