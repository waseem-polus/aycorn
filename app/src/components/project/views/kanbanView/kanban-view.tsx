import { DndContext, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/project/views/kanbanView/kanban-column";
import { ViewHeader } from "@/components/project/views/view-header";
import { useContext, useState } from "react";
import type { ChecklistTask, Status, Task } from "@/types/types";
import { KanbanItem } from "./kanban-item";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

export function KanbanView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Project } = useContext(ProjectContext);
  const { update } = useTaskMutation(Project.ID);

  const [draggedTask, setDraggedTask] = useState<ChecklistTask | null>(null);

  const handleDragEnd = (e: DragEndEvent) => {
    if (draggedTask && e.over?.id && e.over.id !== draggedTask.Status) {
      update.mutate({
        ...draggedTask,
        Status: e.over.id as Status,
      } as Task);
    }

    setDraggedTask(null);
  };

  const handleDragStart = (e: DragEndEvent) => {
    setDraggedTask(
      (e.active.data?.current?.task as ChecklistTask | null) ?? null,
    );
  };

  const handleDragCancel = () => {
    console.log("Cancelled drag");
    setDraggedTask(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // pixels of movement required before drag starts
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
        <div className="div flex gap-2 h-full min-h-0">
          <KanbanColumn
            status="Blocked"
            description="Tasks cannot be started"
          />
          <KanbanColumn status="Open" description="Tasks are being planned" />
          <KanbanColumn status="Todo" description="Tasks are ready to start" />
          <KanbanColumn
            status="Doing"
            description="Tasks are being worked on"
          />
          <KanbanColumn status="Done" description="Tasks are completed" />
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedTask && <KanbanItem task={draggedTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
