import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { KanbanColumn } from "@/components/project/views/kanbanView/kanban-column";
import { ViewHeader } from "@/components/project/views/view-header";
import { useCallback, useContext, useRef, useState } from "react";
import type { ChecklistTask, Task } from "@/types/types";
import { KanbanItem } from "./kanban-item";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useSharedSelection } from "@/hooks/useSelection";
import { toast } from "sonner";

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

export function KanbanView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Project, Tasks, Stages } = useContext(ProjectContext);
  const { update, bulkUpdate } = useTaskMutation(Project.ID);

  const [draggedTask, setDraggedTask] = useState<ChecklistTask | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const preserveScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    requestAnimationFrame(() => {
      el.scrollLeft = scrollLeft;
    });
  }, []);

  const [lastDrop, setLastDrop] = useState<{
    taskIds: Set<number>;
    animClass: string;
  } | null>(null);

  const setDropAnimation = (
    taskIds: Set<number>,
    sourceStageId: number,
    destStageId: number,
  ) => {
    const sourceIdx = Stages.findIndex((s) => s.ID === sourceStageId);
    const destIdx = Stages.findIndex((s) => s.ID === destStageId);
    const animClass =
      sourceIdx < destIdx
        ? "animate-in fade-in slide-in-from-left-3 duration-200"
        : "animate-in fade-in slide-in-from-right-3 duration-200";
    setLastDrop({ taskIds, animClass });
    setTimeout(() => setLastDrop(null), 300);
  };

  const { getItemProps, wrapDragStart, wrapDragEnd } = useSharedSelection();

  const handleDragEnd = wrapDragEnd(
    (e: DragEndEvent) => {
      preserveScroll();
      const overId = e.over?.id;
      if (overId === undefined) {
        setDraggedTask(null);
        return;
      }
      const newStage = Number(overId);
      if (draggedTask && newStage !== draggedTask.Stage) {
        setDropAnimation(
          new Set([draggedTask.ID]),
          draggedTask.Stage,
          newStage,
        );
        update.mutate({
          ...draggedTask,
          Stage: newStage,
        } as Task);
      }
      setDraggedTask(null);
    },
    (ids, over) => {
      preserveScroll();
      const sourceStageId = draggedTask?.Stage;
      setDraggedTask(null);
      if (!over) return;
      const newStage = Number(over.id);
      const movingTasks = Tasks.filter(
        (t) => ids.has(t.ID.toString()) && t.Stage !== newStage,
      );
      if (movingTasks.length === 0) return;
      if (sourceStageId !== undefined) {
        setDropAnimation(
          new Set(movingTasks.map((t) => t.ID)),
          sourceStageId,
          newStage,
        );
      }
      const stageName = Stages.find((s) => s.ID === newStage)?.Name ?? "stage";
      bulkUpdate.mutate(
        { tasks: movingTasks, changes: { Stage: newStage } },
        {
          onSuccess: (result) =>
            toast(
              `Moved ${result.success} task${result.success !== 1 ? "s" : ""} to ${stageName}.`,
            ),
          onError: () => toast.error("Failed moving tasks."),
        },
      );
    },
  );

  const handleDragStart = wrapDragStart((e: DragStartEvent) => {
    setDraggedTask(
      (e.active.data?.current?.task as ChecklistTask | null) ?? null,
    );
  });

  const handleDragCancel = () => {
    setDraggedTask(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      // Long press (300ms) on the drag handle to distinguish drag from scroll/tap.
      // Tolerance is kept at 3px — below the browser's ~4px scroll-commit threshold —
      // so event.cancelable stays true when drag activates, letting preventDefault work.
      // Future context menu: detect onDragEnd with over===null + minimal movement.
      activationConstraint: { delay: 300, tolerance: 3 },
    }),
  );

  return (
    <div className="h-full overflow-visible min-h-0 flex flex-col gap-2">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-2 h-full min-h-0 min-w-0 overflow-x-auto"
        >
          {Stages.map((stage) => (
            <KanbanColumn
              key={stage.ID}
              stage={stage}
              getItemProps={getItemProps}
              lastDrop={lastDrop}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={overlayDropAnimation}>
          {draggedTask && <KanbanItem task={draggedTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
