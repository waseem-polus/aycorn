import { useRef, useState } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { DeleteSavedFiltersDialog } from "@/features/saved-filters/delete-saved-filters-dialog";
import type { QuickFiltersAPI } from "@/features/saved-filters/hooks/useQuickFilters";
import { useQuickFilterShortcuts } from "@/features/saved-filters/hooks/useQuickFilterShortcuts";
import { AddFilterPopover } from "@/features/saved-filters/quick-filter-bar/add-filter-popover";
import {
  FilterChip,
  type ChipEditing,
} from "@/features/saved-filters/quick-filter-bar/filter-chip";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";

type Props = {
  api: QuickFiltersAPI;
  /** The values the condition editor offers on this board. */
  sources: ConditionOptionSources;
};

/**
 * A board's quick filters: toggles that stack, each ANDed onto the tasks
 * shown. A toolbar with roving focus — ←/→ move, Enter/Space toggles — plus
 * Alt+1…9 to toggle, Alt+0 to turn all off, and drag to reorder.
 */
export function QuickFilterBar({ api, sources }: Props) {
  const { pinned, savedFilters } = api;
  const [deleting, setDeleting] = useState<SavedFilter | null>(null);
  // One editor open at a time, across the bar.
  const [editing, setEditing] = useState<{ id: number } & NonNullable<ChipEditing> | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useQuickFilterShortcuts(
    pinned.map((f) => f.ID),
    api.toggle,
    api.clearAll,
  );

  const candidates = savedFilters.filter(
    (f) => !pinned.some((p) => p.ID === f.ID),
  );
  const tabStop = Math.min(focusIndex, Math.max(pinned.length - 1, 0));

  // ←/→/Home/End move focus between chips, from whichever chip has it.
  const focusChip = (index: number) => {
    chipRefs.current[Math.min(Math.max(index, 0), pinned.length - 1)]?.focus();
  };
  useHotkeys(
    [
      { hotkey: "ArrowRight", callback: () => focusChip(tabStop + 1) },
      { hotkey: "ArrowLeft", callback: () => focusChip(tabStop - 1) },
      { hotkey: "Home", callback: () => focusChip(0) },
      { hotkey: "End", callback: () => focusChip(pinned.length - 1) },
    ],
    { target: toolbarRef },
  );

  const move = (id: number, delta: -1 | 1) => {
    const ids = pinned.map((f) => f.ID);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    api.reorder(arrayMove(ids, from, to));
  };

  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (!over || dragged.id === over.id) return;
    const ids = pinned.map((f) => f.ID);
    api.reorder(
      arrayMove(
        ids,
        ids.indexOf(Number(dragged.id)),
        ids.indexOf(Number(over.id)),
      ),
    );
  };

  /** Create-empty-then-edit: the new filter opens with its name selected. */
  const createFilter = async () => {
    const created = await api.create("Untitled filter");
    if (created) setEditing({ id: created.ID, saveAs: false, focusName: true });
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Quick filters"
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={pinned.map((f) => f.ID)}
            strategy={horizontalListSortingStrategy}
          >
            {pinned.map((filter, i) => (
              <FilterChip
                key={filter.ID}
                filter={filter}
                api={api}
                sources={sources}
                shortcut={i < 9 ? i + 1 : null}
                focusable={tabStop === i}
                isFirst={i === 0}
                isLast={i === pinned.length - 1}
                editing={
                  editing?.id === filter.ID
                    ? { saveAs: editing.saveAs, focusName: editing.focusName }
                    : null
                }
                onEditingChange={(next) =>
                  setEditing((prev) => {
                    const current =
                      prev?.id === filter.ID
                        ? { saveAs: prev.saveAs, focusName: prev.focusName }
                        : null;
                    const resolved = typeof next === "function" ? next(current) : next;
                    return resolved ? { id: filter.ID, ...resolved } : null;
                  })
                }
                chipRef={(el) => {
                  chipRefs.current[i] = el;
                }}
                onFocus={() => setFocusIndex(i)}
                onMove={(delta) => move(filter.ID, delta)}
                onDelete={() => setDeleting(filter)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <AddFilterPopover
        candidates={candidates}
        onAdd={api.pin}
        onCreate={() => void createFilter()}
      />

      {deleting && (
        <DeleteSavedFiltersDialog
          filters={[deleting]}
          open
          onOpenChange={(open) => !open && setDeleting(null)}
        />
      )}
    </div>
  );
}
