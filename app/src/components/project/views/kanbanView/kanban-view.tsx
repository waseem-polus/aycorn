import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/project/views/kanbanView/kanban-column";
import { ViewHeader } from "@/components/project/views/view-header";
import { useContext, useState } from "react";
import type { ChecklistTask, Status, Task } from "@/types/types";
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
  const { Project, Tasks } = useContext(ProjectContext);
  const { update, bulkUpdate } = useTaskMutation(Project.ID);

  const [draggedTask, setDraggedTask] = useState<ChecklistTask | null>(null);

  const { getItemProps, wrapDragStart, wrapDragEnd } = useSharedSelection();

  const handleDragEnd = wrapDragEnd(
    (e: DragEndEvent) => {
      if (draggedTask && e.over?.id && e.over.id !== draggedTask.Status) {
        update.mutate({
          ...draggedTask,
          Status: e.over.id as Status,
        } as Task);
      }
      setDraggedTask(null);
    },
    (ids, over) => {
      setDraggedTask(null);
      if (!over) return;
      const newStatus = over.id as Status;
      const movingTasks = Tasks.filter(
        (t) => ids.has(t.ID.toString()) && t.Status !== newStatus,
      );
      if (movingTasks.length === 0) return;
      bulkUpdate.mutate(
        { tasks: movingTasks, changes: { Status: newStatus } },
        {
          onSuccess: (count) =>
            toast(`Moved ${count} task${count !== 1 ? "s" : ""} to ${newStatus}.`),
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
          <KanbanColumn
            status="Blocked"
            description="Tasks cannot be started"
            getItemProps={getItemProps}
          />
          <KanbanColumn
            status="Open"
            description="Tasks are being planned"
            getItemProps={getItemProps}
          />
          <KanbanColumn
            status="Todo"
            description="Tasks are ready to start"
            getItemProps={getItemProps}
          />
          <KanbanColumn
            status="Doing"
            description="Tasks are being worked on"
            getItemProps={getItemProps}
          />
          <KanbanColumn
            status="Done"
            description="Tasks are completed"
            getItemProps={getItemProps}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedTask && <KanbanItem task={draggedTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
