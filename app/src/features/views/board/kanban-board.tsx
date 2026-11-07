import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { KanbanItem } from "@/components/project/views/kanbanView/kanban-item";
import { isUnchangedBy } from "@/features/task/shared/shared-task-type";
import type { BoardColumn as Column } from "@/features/views/board/board-columns";
import { BoardColumn } from "@/features/views/board/kanban-board/board-column";
import { useSharedSelection } from "@/hooks/useSelection";
import { useTaskMutation } from "@/queries/useTaskMutation";
import type { ChecklistTask, Task } from "@/types/types";

const overlayDropAnimation: DropAnimation = {
  duration: 200,
  easing: "ease-out",
  keyframes({ transform }) {
    const initial = CSS.Transform.toString(transform.initial);
    return [
      { opacity: "1", transform: initial },
      { opacity: "0", transform: `${initial} scale(0.95)` },
    ];
  },
};

type Props = {
  columns: Column[];
  /** Cache target for the drop's update; null on cross-project boards. */
  projectId: number | null;
  /** A column's create control, for surfaces that create tasks in place. */
  renderCreate?: (column: Column) => ReactNode;
};

/**
 * A board view: columns from the view's grouping, cards dragged between them.
 * A drop writes the target column's `changes` onto the task (or the whole
 * selection, in one bulk request). Drag-move carve-out: the cards move at
 * once and revert if the server rejects it.
 */
export function KanbanBoard({ columns, projectId, renderCreate }: Props) {
  const { update, bulkUpdate } = useTaskMutation(projectId);
  const [draggedTask, setDraggedTask] = useState<ChecklistTask | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lastDrop, setLastDrop] = useState<{
    taskIds: Set<number>;
    animClass: string;
  } | null>(null);

  const preserveScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    requestAnimationFrame(() => {
      el.scrollLeft = scrollLeft;
    });
  }, []);

  const columnIndexOf = (taskId: number) =>
    columns.findIndex((c) => c.tasks.some((t) => t.ID === taskId));

  const animateDrop = (taskIds: Set<number>, fromIndex: number, toIndex: number) => {
    const animClass =
      fromIndex < toIndex
        ? "animate-in fade-in slide-in-from-left-3 duration-200"
        : "animate-in fade-in slide-in-from-right-3 duration-200";
    setLastDrop({ taskIds, animClass });
    setTimeout(() => setLastDrop(null), 300);
  };

  const { getItemProps, wrapDragStart, wrapDragEnd } = useSharedSelection();
  const allTasks = columns.flatMap((c) => c.tasks);

  const handleDragEnd = wrapDragEnd(
    (e: DragEndEvent) => {
      preserveScroll();
      const task = draggedTask;
      setDraggedTask(null);
      const target = columns.find((c) => c.key === e.over?.id);
      if (!task || !target || isUnchangedBy(task, target.changes)) return;
      const reason = target.rejects(task);
      if (reason) {
        toast.error(`Can't move “${task.Name || "Untitled Task"}” there. ${reason}`);
        return;
      }
      animateDrop(new Set([task.ID]), columnIndexOf(task.ID), columns.indexOf(target));
      update.mutate({ ...task, ...target.changes } as Task);
    },
    (ids, over) => {
      preserveScroll();
      const sourceIndex = draggedTask ? columnIndexOf(draggedTask.ID) : -1;
      setDraggedTask(null);
      const target = columns.find((c) => c.key === over?.id);
      if (!target) return;
      const selected = allTasks.filter((t) => ids.has(t.ID.toString()));
      const moving = selected.filter(
        (t) => !isUnchangedBy(t, target.changes) && !target.rejects(t),
      );
      const refused = selected.filter(
        (t) => !isUnchangedBy(t, target.changes) && target.rejects(t),
      ).length;
      if (moving.length === 0) {
        if (refused > 0) toast.error(`Can't move these tasks to “${target.label}”.`);
        return;
      }
      if (sourceIndex >= 0) {
        animateDrop(new Set(moving.map((t) => t.ID)), sourceIndex, columns.indexOf(target));
      }
      bulkUpdate.mutate(
        { tasks: moving, changes: target.changes },
        {
          onSuccess: (result) =>
            toast(
              `Moved ${result.success} task${result.success !== 1 ? "s" : ""} to ${target.label}.` +
                (refused > 0 ? ` ${refused} can't go there.` : ""),
            ),
          onError: () => toast.error("Failed moving tasks."),
        },
      );
    },
  );

  const handleDragStart = wrapDragStart((e: DragStartEvent) => {
    setDraggedTask((e.active.data?.current?.task as ChecklistTask | null) ?? null);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      // Long press (300ms) on the drag handle to distinguish drag from scroll/tap.
      // Tolerance is kept at 3px — below the browser's ~4px scroll-commit threshold —
      // so event.cancelable stays true when drag activates, letting preventDefault work.
      activationConstraint: { delay: 300, tolerance: 3 },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggedTask(null)}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-2 h-full min-h-0 min-w-0 overflow-x-auto"
      >
        {columns.map((column) => (
          <BoardColumn
            key={column.key}
            column={column}
            getItemProps={getItemProps}
            lastDrop={lastDrop}
            create={renderCreate?.(column)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={overlayDropAnimation}>
        {draggedTask && <KanbanItem task={draggedTask} />}
      </DragOverlay>
    </DndContext>
  );
}
