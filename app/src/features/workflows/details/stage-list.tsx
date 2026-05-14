import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Stage, StageType } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StageRow } from "@/features/workflows/details/stage-row";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { useSharedSelection } from "@/hooks/useSelection";

const ADDABLE_STAGE_TYPES: Exclude<StageType, "open">[] = [
  "todo",
  "doing",
  "done",
  "blocked",
];

export function StageList({
  stages,
  workflowId,
}: {
  stages: Stage[];
  workflowId: number;
}) {
  const { createStage, reorderStages, bulkMoveStages } =
    useStageMutation(workflowId);
  const { wrapDragEnd } = useSharedSelection();
  const [items, setItems] = useState(stages);

  useEffect(() => {
    setItems(stages);
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = wrapDragEnd(
    (e: DragEndEvent) => {
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
    },
    (ids, over) => {
      if (!over) return;
      const overId = Number(over.id);
      const selectedSet = new Set(Array.from(ids).map((id) => Number(id)));

      const block = items.filter((s) => selectedSet.has(s.ID));
      const remaining = items.filter((s) => !selectedSet.has(s.ID));
      if (block.length === 0) return;

      let insertIdx = 0;
      const anchorIndex = items.findIndex((s) => s.ID === overId);
      if (anchorIndex !== -1) {
        let anchorId: number | null = overId;
        if (selectedSet.has(overId)) {
          anchorId = null;
          for (let i = anchorIndex - 1; i >= 0; i--) {
            if (!selectedSet.has(items[i].ID)) {
              anchorId = items[i].ID;
              break;
            }
          }
        }
        if (anchorId !== null) {
          const idx = remaining.findIndex((s) => s.ID === anchorId);
          insertIdx = idx === -1 ? 0 : idx + 1;
        }
      }

      const next = [
        ...remaining.slice(0, insertIdx),
        ...block,
        ...remaining.slice(insertIdx),
      ];
      setItems(next);

      const afterId =
        insertIdx === 0 ? null : remaining[insertIdx - 1]?.ID ?? null;

      bulkMoveStages.mutate(
        { ids: block.map((s) => s.ID), afterId },
        {
          onError: (err) => {
            setItems(stages);
            toast(err.message || "Failed to move stages.");
          },
        },
      );
    },
  );

  const handleAdd = (type: Exclude<StageType, "open">) => {
    createStage.mutate(type, {
      onError: (err) => toast(err.message || "Failed to add stage."),
    });
  };

  return (
    <section className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Stages</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={createStage.isPending}
            >
              <Plus />
              Add stage
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ADDABLE_STAGE_TYPES.map((type) => (
              <DropdownMenuItem key={type} onClick={() => handleAdd(type)}>
                <StageTypeBadge type={type} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.ID)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
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
