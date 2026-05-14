import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/project/views/kanbanView/kanban-column";
import { ViewHeader } from "@/components/project/views/view-header";
import { useContext, useState } from "react";
import type { ChecklistTask, Task } from "@/types/types";
import { KanbanItem } from "./kanban-item";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useSharedSelection } from "@/hooks/useSelection";
import { toast } from "sonner";

export function KanbanView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Project, Tasks, Stages } = useContext(ProjectContext);
  const { update, bulkUpdate } = useTaskMutation(Project.ID);

  const [draggedTask, setDraggedTask] = useState<ChecklistTask | null>(null);

  const { getItemProps, wrapDragStart, wrapDragEnd } = useSharedSelection();

  const handleDragEnd = wrapDragEnd(
    (e: DragEndEvent) => {
      const overId = e.over?.id;
      if (overId === undefined) {
        setDraggedTask(null);
        return;
      }
      const newStage = Number(overId);
      if (draggedTask && newStage !== draggedTask.Stage) {
        update.mutate({
          ...draggedTask,
          Stage: newStage,
        } as Task);
      }
      setDraggedTask(null);
    },
    (ids, over) => {
      setDraggedTask(null);
      if (!over) return;
      const newStage = Number(over.id);
      const movingTasks = Tasks.filter(
        (t) => ids.has(t.ID.toString()) && t.Stage !== newStage,
      );
      if (movingTasks.length === 0) return;
      const stageName =
        Stages.find((s) => s.ID === newStage)?.Name ?? "stage";
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
      activationConstraint: {
        distance: 8,
      },
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
        <div className="flex gap-2 h-full min-h-0">
          {Stages.map((stage) => (
            <KanbanColumn
              key={stage.ID}
              stage={stage}
              getItemProps={getItemProps}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedTask && <KanbanItem task={draggedTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
