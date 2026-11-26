import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { viewFilters } from "@/features/saved-filters/board";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import { useSavedFiltersQuery } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import { PinnedFilterRow } from "@/features/views/view-menu/saved-filters-flyout/pinned-filter-row";
import type { BoardView } from "@/features/views/view-types";

/**
 * The view menu's Saved filters flyout: which saved filters this view's bar
 * offers, in bar order. Add, remove and reorder (drag, or focus a grip and
 * Space, arrows, Space); every change saves at once. Works for any view's
 * menu, not just the active one, so it reads the shared filter list itself.
 */
export function SavedFiltersFlyout({ view }: { view: BoardView }) {
  const [adding, setAdding] = useState(false);
  const { data: savedFilters = [] } = useSavedFiltersQuery();
  const { setViewFilters } = useSavedFilterMutations();
  const pinned = viewFilters(savedFilters, view.ID);
  const candidates = savedFilters.filter((f) => !pinned.some((p) => p.ID === f.ID));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const save = (ids: number[]) =>
    setViewFilters.mutate(
      { view, ids },
      { onError: () => toast.error("Couldn't update the view's saved filters. Try again.") },
    );

  const ids = pinned.map((f) => f.ID);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    save(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))));
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      {pinned.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-3 text-center text-sm text-muted-foreground">
          No saved filters on this view.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-0.5">
              {pinned.map((filter) => (
                <PinnedFilterRow
                  key={filter.ID}
                  filter={filter}
                  onRemove={() => save(ids.filter((id) => id !== filter.ID))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Popover open={adding} onOpenChange={setAdding}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-muted-foreground"
            disabled={candidates.length === 0}
          >
            <PlusIcon />
            {candidates.length > 0
              ? "Add saved filter"
              : savedFilters.length > 0
                ? "Every saved filter is here"
                : "No saved filters yet"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60 p-0">
          <OptionCommandList
            options={candidates.map((f) => ({ key: f.ID, label: f.Name }))}
            selected={[]}
            searchPlaceholder="Search filters…"
            onSelect={(key) => {
              save([...ids, Number(key)]);
              setAdding(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
