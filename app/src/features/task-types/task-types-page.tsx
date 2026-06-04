import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type Over,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  useTaskTypesQuery,
  type TaskTypeUsageFilter,
} from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { useTaskTypeCategoryMutation } from "@/features/task-types/queries/useTaskTypeCategoryMutation";
import { TaskTypeCard } from "@/features/task-types/task-type-card";
import { TaskTypeCategorySection } from "@/features/task-types/task-type-category-section";
import { TaskTypesBulkActionsToolbar } from "@/features/task-types/task-types-bulk-actions-toolbar";
import { useSharedSelection } from "@/hooks/useSelection";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import type { TaskTypeCategory, TaskTypeGlobal } from "@/types/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const successDropAnimation: DropAnimation = {
  duration: 200,
  easing: "ease-out",
  keyframes: ({ transform }) => [
    { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
    { opacity: 0, transform: CSS.Transform.toString(transform.initial) },
  ],
};

const cancelDropAnimation: DropAnimation = { duration: 250, easing: "ease" };

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

function DraggableTaskTypeCard({ type }: { type: TaskTypeGlobal }) {
  const { getItemProps } = useSharedSelection();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tt-${type.ID}`,
    data: { type: "taskType", taskTypeId: type.ID },
  });

  const { onTouchStart, ...pointerListeners } = (listeners ?? {}) as {
    onTouchStart?: React.TouchEventHandler;
  } & DragListeners;

  const itemProps = getItemProps(`tt-${type.ID}`, {
    listeners: pointerListeners,
  });

  return (
    <TaskTypeCard
      type={type}
      dragRef={setNodeRef}
      dragStyle={{ opacity: isDragging ? 0.4 : 1 }}
      dragAttributes={attributes as unknown as Record<string, unknown>}
      itemProps={itemProps}
    >
      <button
        type="button"
        data-drag-handle=""
        aria-label="Drag to move to another category"
        onTouchStart={onTouchStart}
        style={{ touchAction: "none" }}
        className="hidden pointer-coarse:flex cursor-grab text-muted-foreground p-1 rounded hover:bg-accent"
      >
        <GripVertical className="size-4" />
      </button>
    </TaskTypeCard>
  );
}

export function TaskTypesPage() {
  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<TaskTypeUsageFilter>("all");
  const { data: types = [], isFetching: typesFetching } =
    useTaskTypesQuery(usageFilter);
  const { data: categories = [], isFetching: categoriesFetching } =
    useTaskTypeCategoriesQuery();
  const { updateTaskType, bulkUpdateTaskTypes } = useTaskTypeMutation();
  const { createCategory, reorderCategories } = useTaskTypeCategoryMutation();
  const { wrapDragStart, wrapDragEnd } = useSharedSelection();

  const [orderedCategories, setOrderedCategories] = useState<
    TaskTypeCategory[]
  >([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<number | null>(
    null,
  );
  // taskTypeId -> optimistic category while a (single or bulk) move is in flight.
  const [pendingCategoryMoves, setPendingCategoryMoves] = useState<
    Record<number, number>
  >({});
  const [dropResult, setDropResult] = useState<"success" | "cancel" | null>(
    null,
  );

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const typesByCategory = useMemo(() => {
    const map = new Map<number, TaskTypeGlobal[]>();
    for (const type of types) {
      const category = pendingCategoryMoves[type.ID] ?? type.Category;
      const bucket = map.get(category) ?? [];
      bucket.push(type);
      map.set(category, bucket);
    }
    return map;
  }, [types, pendingCategoryMoves]);

  // Group types per category, applying search filter.
  const filteredByCategory = useMemo(() => {
    if (!search) return typesByCategory;
    const q = search.toLowerCase();
    const filtered = new Map<number, TaskTypeGlobal[]>();
    for (const [catId, catTypes] of typesByCategory) {
      const matching = catTypes.filter((t) => t.Name.toLowerCase().includes(q));
      if (matching.length > 0) filtered.set(catId, matching);
    }
    return filtered;
  }, [typesByCategory, search]);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
    setDropResult(null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;

    if (
      activeId.startsWith("cat-") &&
      overId?.startsWith("cat-") &&
      activeId !== overId
    ) {
      setOrderedCategories((prev) => {
        const oldIndex = prev.findIndex((c) => `cat-${c.ID}` === activeId);
        const newIndex = prev.findIndex((c) => `cat-${c.ID}` === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    if (overId?.startsWith("cat-") && activeId.startsWith("tt-")) {
      setDragOverCategoryId(parseInt(overId.slice(4)));
    } else {
      setDragOverCategoryId(null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const activeId = String(active.id);
    setActiveDragId(null);
    setDragOverCategoryId(null);

    if (!over) {
      if (activeId.startsWith("tt-")) setDropResult("cancel");
      return;
    }

    const overId = String(over.id);

    if (activeId.startsWith("cat-") && overId.startsWith("cat-")) {
      reorderCategories.mutate(
        orderedCategories.map((c) => c.ID),
        {
          onError: () => {
            setOrderedCategories(categories);
            toast.error("Failed to reorder categories.");
          },
        },
      );
    } else if (activeId.startsWith("tt-") && overId.startsWith("cat-")) {
      const taskTypeId = parseInt(activeId.slice(3));
      const newCategoryId = parseInt(overId.slice(4));
      const taskType = types.find((t) => t.ID === taskTypeId);
      if (!taskType || taskType.Category === newCategoryId) {
        setDropResult("cancel");
        return;
      }

      setDropResult("success");
      setPendingCategoryMoves((prev) => ({
        ...prev,
        [taskTypeId]: newCategoryId,
      }));
      updateTaskType.mutate(
        { ...taskType, Category: newCategoryId },
        {
          onSettled: () => clearPendingMoves([taskTypeId]),
          onError: () => toast.error("Failed to move type."),
        },
      );
    }
  };

  const clearPendingMoves = (ids: number[]) =>
    setPendingCategoryMoves((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });

  // Bulk drag: move every selected type onto the dropped-on category in one
  // request (no fan-out). Optimistic per the dnd drag-move carve-out.
  const handleBulkMoveToCategory = (ids: Set<string>, over: Over | null) => {
    setActiveDragId(null);
    setDragOverCategoryId(null);

    const overId = over ? String(over.id) : null;
    if (!overId?.startsWith("cat-")) {
      setDropResult("cancel");
      return;
    }
    const newCategoryId = parseInt(overId.slice(4));
    const typeIds = Array.from(ids)
      .filter((id) => id.startsWith("tt-"))
      .map((id) => parseInt(id.slice(3)))
      .filter((tid) => {
        const t = types.find((x) => x.ID === tid);
        return t !== undefined && t.Category !== newCategoryId;
      });

    if (typeIds.length === 0) {
      setDropResult("cancel");
      return;
    }

    setDropResult("success");
    setPendingCategoryMoves((prev) => {
      const next = { ...prev };
      for (const tid of typeIds) next[tid] = newCategoryId;
      return next;
    });
    bulkUpdateTaskTypes.mutate(
      { ids: typeIds, changes: { Category: newCategoryId } },
      {
        onSuccess: (result) =>
          bulkResultToast(
            result,
            `Moved ${result.success} type${result.success !== 1 ? "s" : ""}.`,
          ),
        onError: () => toast.error("Failed to move types."),
        onSettled: () => clearPendingMoves(typeIds),
      },
    );
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setDragOverCategoryId(null);
    setDropResult("cancel");
  };

  const activeDragType = types.find((t) => activeDragId === `tt-${t.ID}`);

  const handleCreateCategory = () => {
    createCategory.mutate(undefined, {
      onError: () => toast.error("Failed to create category."),
    });
  };

  const isLoading =
    (typesFetching && types.length === 0) ||
    (categoriesFetching && categories.length === 0);

  const visibleCategories = orderedCategories.filter(
    (c) => !search || filteredByCategory.has(c.ID),
  );

  const totalFilteredCount = useMemo(
    () =>
      Array.from(filteredByCategory.values()).reduce(
        (n, ts) => n + ts.length,
        0,
      ),
    [filteredByCategory],
  );

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex gap-2 items-center flex-col md:flex-row">
        <InputGroup>
          <InputGroupInput
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {search ? `${totalFilteredCount} types` : `${types.length} types`}
          </InputGroupAddon>
        </InputGroup>

        <div className="flex gap-2 justify-between sm:justify-end w-full md:w-fit">
          <ToggleGroup
            type="single"
            variant="outline"
            value={usageFilter}
            onValueChange={(v) =>
              setUsageFilter((v || "all") as TaskTypeUsageFilter)
            }
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="in-use">In Use</ToggleGroupItem>
            <ToggleGroupItem value="unused">Unused</ToggleGroupItem>
          </ToggleGroup>
          <Button
            onClick={handleCreateCategory}
            disabled={createCategory.isPending}
          >
            <Plus />
            New Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          Loading types...
        </div>
      ) : visibleCategories.length === 0 && search ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          No types match your search.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={wrapDragStart(handleDragStart)}
          onDragOver={handleDragOver}
          onDragEnd={wrapDragEnd(handleDragEnd, handleBulkMoveToCategory)}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={orderedCategories.map((c) => `cat-${c.ID}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              {orderedCategories.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
                  No task types yet.
                </div>
              ) : (
                visibleCategories.map((category) => (
                  <TaskTypeCategorySection
                    key={category.ID}
                    category={category}
                    allCategories={orderedCategories}
                    types={filteredByCategory.get(category.ID) ?? []}
                    isDropTarget={
                      dragOverCategoryId === category.ID &&
                      activeDragId?.startsWith("tt-") === true
                    }
                    renderTypeCard={(type) => (
                      <DraggableTaskTypeCard key={type.ID} type={type} />
                    )}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={
              dropResult === "success"
                ? successDropAnimation
                : dropResult === "cancel"
                  ? cancelDropAnimation
                  : null
            }
          >
            {activeDragType ? (
              <div className="opacity-90 rotate-1 pointer-events-none">
                <TaskTypeCard type={activeDragType} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskTypesBulkActionsToolbar
        types={types}
        categories={orderedCategories}
      />
    </div>
  );
}
