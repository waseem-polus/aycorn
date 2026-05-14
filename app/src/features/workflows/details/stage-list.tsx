import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Stage } from "@/types/types";
import { Button } from "@/components/ui/button";
import { StageRow } from "@/features/workflows/details/stage-row";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";

export function StageList({
  stages,
  workflowId,
}: {
  stages: Stage[];
  workflowId: number;
}) {
  const { reorderStages } = useStageMutation(workflowId);
  const [items, setItems] = useState(stages);

  useEffect(() => {
    setItems(stages);
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.ID === active.id);
    const newIndex = items.findIndex((s) => s.ID === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    reorderStages.mutate(
      reordered.map((s) => s.ID),
      {
        onError: (err) => {
          setItems(stages);
          toast(err.message || "Failed to reorder stages.");
        },
      },
    );
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Stages</h2>
        {/* TODO: wire up add stage mutation */}
        <Button variant="outline" size="sm">
          <Plus />
          Add stage
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.ID)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((stage) => (
              <StageRow
                key={stage.ID}
                stage={stage}
                workflowId={workflowId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
