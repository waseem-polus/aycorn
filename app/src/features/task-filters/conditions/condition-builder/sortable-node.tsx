import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { DropLine } from "@/features/task-filters/conditions/condition-builder/drop-line";

type Props = {
  id: string;
  groupId: string;
  /** Receives the drag handle to place in the node's header row. */
  children: (handle: ReactNode) => ReactNode;
};

/**
 * Makes a condition or group draggable by its grip. The node itself doesn't
 * move while dragging — a floating preview follows the pointer and a line
 * marks where it will land — so the original stays in place, dimmed, as the
 * "from" marker.
 */
export function SortableNode({ id, groupId, children }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useSortable({ id, data: { groupId } });
  const { dropTarget } = useConditionBuilder();
  const isOver = dropTarget?.overId === id;

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      data-drag-handle=""
      style={{ touchAction: "none" }}
      className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
      aria-label="Drag to move"
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      data-task-card=""
      className={cn("relative", isDragging && "opacity-40")}
    >
      {isOver && !dropTarget.after && <DropLine edge="top" />}
      {children(handle)}
      {isOver && dropTarget.after && <DropLine edge="bottom" />}
    </div>
  );
}
