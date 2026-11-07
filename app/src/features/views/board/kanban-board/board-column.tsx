import type { ReactNode, SyntheticEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { ItemGroup } from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KanbanItem } from "@/components/project/views/kanbanView/kanban-item";
import { stageTintClass } from "@/features/stage/stage-visual";
import type { BoardColumn as Column } from "@/features/views/board/board-columns";
import { useDropZone } from "@/hooks/useDropZone";
import { cn } from "@/lib/utils";

type DragListeners = Record<string, (e: SyntheticEvent) => void>;

type Props = {
  column: Column;
  getItemProps?: (
    id: string,
    opts?: { listeners?: DragListeners },
  ) => Record<string, unknown>;
  lastDrop?: { taskIds: Set<number>; animClass: string } | null;
  /** The column's create control, when the surface supports creating here. */
  create?: ReactNode;
};

/** One board column: header (marker, label, count, description) over a drop zone of cards. */
export function BoardColumn({ column, getItemProps, lastDrop, create }: Props) {
  const { setNodeRef, isOver } = useDropZone(column.key);

  return (
    <div className="min-w-64 w-full overflow-hidden flex flex-col gap-2 p-1 h-full min-h-full">
      <div className="flex justify-between items-center shrink">
        <div className="p-2 flex-1 min-w-0">
          <span className="flex items-center gap-2 text-foreground">
            {column.marker}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{column.label}</span>
              </TooltipTrigger>
              <TooltipContent>{column.label}</TooltipContent>
            </Tooltip>
            <Badge variant="outline" className="size-5">
              {column.tasks.length}
            </Badge>
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground text-sm h-5 block truncate">
                {column.description}
              </span>
            </TooltipTrigger>
            {column.description && <TooltipContent>{column.description}</TooltipContent>}
          </Tooltip>
        </div>
        {create}
      </div>
      <ItemGroup
        className={cn(
          "h-full overflow-y-scroll w-full min-w-0 overflow-x-visible flex flex-col gap-2 p-2 rounded-xl",
          isOver && stageTintClass(column.color),
        )}
        ref={setNodeRef}
      >
        {column.tasks.map((task) => (
          <KanbanItem
            key={task.ID}
            task={task}
            getItemProps={getItemProps}
            animClass={lastDrop?.taskIds.has(task.ID) ? lastDrop.animClass : undefined}
          />
        ))}
      </ItemGroup>
    </div>
  );
}
