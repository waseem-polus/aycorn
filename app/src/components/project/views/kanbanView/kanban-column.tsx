import TaskStatusIcon from "@/features/task/properties/icons/TaskStatusIcon";
import { Badge } from "@/components/ui/badge";
import { ItemGroup } from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useDropZone } from "@/hooks/useDropZone";
import type { Task } from "@/types/types";
import { useContext, useMemo, type SyntheticEvent } from "react";
import { KanbanItem } from "./kanban-item";
import { cva } from "class-variance-authority";

type DragListeners = Record<string, (e: SyntheticEvent) => void>;

export function KanbanColumn({
  status,
  description,
  getItemProps,
}: {
  status: Task["Status"];
  description: string;
  getItemProps?: (
    id: string,
    opts?: { listeners?: DragListeners },
  ) => Record<string, unknown>;
}) {
  const { setNodeRef, isOver } = useDropZone(status);

  const { Tasks } = useContext(ProjectContext);
  const filteredTasks = useMemo(
    () =>
      Tasks.filter((task) => {
        return task.Status === status;
      }),
    [Tasks, status],
  );

  const kanbanColClass = cva(
    [
      "h-full overflow-y-scroll w-full min-w-0 overflow-x-visible flex flex-col gap-2 p-2 rounded-xl",
    ],
    {
      variants: {
        activeDropZone: {
          true: "", // color applied via compoundVariants
          false: "",
        },
        type: {
          Blocked: "",
          Open: "",
          Todo: "",
          Doing: "",
          Done: "",
        },
      },
      compoundVariants: [
        { activeDropZone: true, type: "Blocked", class: "bg-red-50" },
        { activeDropZone: true, type: "Open", class: "bg-primary/10" },
        { activeDropZone: true, type: "Todo", class: "bg-orange-50" },
        { activeDropZone: true, type: "Doing", class: "bg-green-50" },
        { activeDropZone: true, type: "Done", class: "bg-purple-50" },
      ],
      defaultVariants: { activeDropZone: false, type: "Open" },
    },
  );

  return (
    <div className="w-1/5 overflow-hidden flex flex-col gap-2 p-1 h-full min-h-full">
      <div className="p-2">
        <span className="flex items-center gap-2">
          <TaskStatusIcon variant={status} />
          {status}
          <Badge variant="outline" className="size-5">
            {filteredTasks.length}
          </Badge>
        </span>
        <span className="text-neutral-500 text-sm">{description}</span>
      </div>
      <ItemGroup
        className={kanbanColClass({ activeDropZone: isOver, type: status })}
        ref={setNodeRef}
      >
        {filteredTasks.map((task) => (
          <KanbanItem
            key={task.ID}
            task={task}
            getItemProps={getItemProps}
          />
        ))}
      </ItemGroup>
    </div>
  );
}
