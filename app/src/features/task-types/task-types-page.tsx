import { useEffect, useMemo, useState } from "react";
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
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
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
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { useTaskTypeCategoryMutation } from "@/features/task-types/queries/useTaskTypeCategoryMutation";
import { TaskTypeCard } from "@/features/task-types/task-type-card";
import { TaskTypeCategorySection } from "@/features/task-types/task-type-category-section";
import type { TaskTypeCategory, TaskTypeGlobal } from "@/types/types";

function DraggableTaskTypeCard({ type }: { type: TaskTypeGlobal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tt-${type.ID}`,
    data: { type: "taskType", taskTypeId: type.ID },
  });

  return (
    <div
      ref={setNodeRef}
      className="group h-full"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <TaskTypeCard
        type={type}
        dragHandle={
          <div
            className="cursor-grab touch-none select-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
            data-drag-handle=""
            {...attributes}
            {...listeners}
            aria-label="Drag to move to another category"
          >
            <GripVertical className="size-4" />
          </div>
        }
      />
    </div>
  );
}

export function TaskTypesPage() {
  const [search, setSearch] = useState("");
  const { data: types = [], isFetching: typesFetching } = useTaskTypesQuery();
  const { data: categories = [], isFetching: categoriesFetching } =
    useTaskTypeCategoriesQuery();
  const { createTaskType, updateTaskType } = useTaskTypeMutation();
  const { createCategory, reorderCategories } = useTaskTypeCategoryMutation();

  const [orderedCategories, setOrderedCategories] = useState<
    TaskTypeCategory[]
  >([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<number | null>(
    null,
  );
  const [pendingCategoryMove, setPendingCategoryMove] = useState<{
    taskTypeId: number;
    newCategoryId: number;
  } | null>(null);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const typesByCategory = useMemo(() => {
    const map = new Map<number, TaskTypeGlobal[]>();
    for (const type of types) {
      const category =
        pendingCategoryMove?.taskTypeId === type.ID
          ? pendingCategoryMove.newCategoryId
          : type.Category;
      const bucket = map.get(category) ?? [];
      bucket.push(type);
      map.set(category, bucket);
    }
    return map;
  }, [types, pendingCategoryMove]);

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
    setActiveDragId(null);
    setDragOverCategoryId(null);

    if (!over) return;

    const activeId = String(active.id);
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
      if (!taskType || taskType.Category === newCategoryId) return;

      setPendingCategoryMove({ taskTypeId, newCategoryId });
      updateTaskType.mutate(
        { ...taskType, Category: newCategoryId },
        {
          onSettled: () => setPendingCategoryMove(null),
          onError: () => toast.error("Failed to move type."),
        },
      );
    }
  };

  const activeDragType = types.find((t) => activeDragId === `tt-${t.ID}`);

  const handleCreate = () => {
    createTaskType.mutate(
      {},
      { onError: () => toast.error("Failed to create type.") },
    );
  };

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

        <div className="flex gap-2 justify-end w-full md:w-fit">
          <Button
            variant="outline"
            onClick={handleCreateCategory}
            disabled={createCategory.isPending}
          >
            <Plus />
            New Category
          </Button>
          <Button onClick={handleCreate} disabled={createTaskType.isPending}>
            <Plus />
            New Type
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedCategories.map((c) => `cat-${c.ID}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto p-1">
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

          <DragOverlay dropAnimation={null}>
            {activeDragType ? (
              <div className="opacity-90 rotate-1 pointer-events-none">
                <TaskTypeCard type={activeDragType} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
