import TaskStatusIcon from "@/components/task/taskDrawer/icons/TaskStatusIcon";
import { Badge } from "@/components/ui/badge";
import { ItemGroup } from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useDropZone } from "@/hooks/useDropZone";
import type { Task } from "@/types/types";
import { useContext, useMemo } from "react";
import { KanbanItem } from "./kanban-item";
import { cva } from "class-variance-authority";

export function KanbanColumn({
  status,
  description,
}: {
  status: Task["Status"];
  description: string;
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
      "h-full overflow-y-scroll w-full min-w-0 overflow-x-visible flex flex-col gap-2 pr-2",
    ],
    {
      variants: {
        activeDropZone: {
          false: false,
          true: "bg-primary/10",
        },
      },
    },
  );

  return (
    <div className="w-1/5 overflow-hidden flex flex-col gap-2 p-1 h-full min-h-full">
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
      <ItemGroup
        className={kanbanColClass({ activeDropZone: isOver })}
        ref={setNodeRef}
      >
        {filteredTasks.map((task) => (
          <KanbanItem key={task.ID} task={task} />
        ))}
      </ItemGroup>
    </div>
  );
}
