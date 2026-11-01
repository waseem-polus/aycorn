import { useRef, useState, type KeyboardEvent } from "react";
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
import { BookmarkPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteSavedFiltersDialog } from "@/features/saved-filters/delete-saved-filters-dialog";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";
import { useQuickFilterShortcuts } from "@/features/saved-filters/hooks/useQuickFilterShortcuts";
import { AddFilterPopover } from "@/features/saved-filters/quick-filter-bar/add-filter-popover";
import { FilterChip } from "@/features/saved-filters/quick-filter-bar/filter-chip";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { cn } from "@/lib/utils";

type Props = { api: BoardFilterAPI };

/**
 * A board's quick filters: its scratch filter, then the saved filters pinned
 * here. One is active at a time. A roving-focus tablist — ←/→ move, Enter
 * activates — with Alt+0…9 shortcuts and drag to reorder.
 */
export function QuickFilterBar({ api }: Props) {
  const { pinned, active, savedFilters } = api;
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleting, setDeleting] = useState<SavedFilter | null>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useQuickFilterShortcuts(
    pinned.map((f) => f.ID),
    api.activate,
  );

  const activeIndex = active
    ? pinned.findIndex((f) => f.ID === active.ID) + 1
    : 0;
  const candidates = savedFilters.filter(
    (f) => !pinned.some((p) => p.ID === f.ID),
  );
  const canSave = api.activeFilterCount() > 0 || !!active;

  // Index 0 is the scratch chip; pinned filters follow.
  const navigate = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = pinned.length;
    const next =
      e.key === "ArrowRight"
        ? Math.min(index + 1, last)
        : e.key === "ArrowLeft"
          ? Math.max(index - 1, 0)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    chipRefs.current[next]?.focus();
  };

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

  return (
    <div className="flex items-center gap-1.5">
      <div
        role="tablist"
        aria-label="Quick filters"
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={(el) => {
                chipRefs.current[0] = el;
              }}
              type="button"
              role="tab"
              aria-selected={!active}
              tabIndex={activeIndex === 0 ? 0 : -1}
              onClick={() => api.activate(null)}
              onKeyDown={navigate(0)}
              className={cn(
                "flex h-8 shrink-0 items-center rounded-md border px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                !active
                  ? "border-primary/40 bg-accent text-accent-foreground"
                  : "bg-background hover:bg-accent/50",
              )}
            >
              {api.scratchLabel}
            </button>
          </TooltipTrigger>
          <TooltipContent>Alt+0</TooltipContent>
        </Tooltip>

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
                active={active?.ID === filter.ID}
                edited={api.hasUnsavedEdits(filter)}
                shortcut={i < 9 ? i + 1 : null}
                focusable={activeIndex === i + 1}
                isFirst={i === 0}
                isLast={i === pinned.length - 1}
                chipRef={(el) => {
                  chipRefs.current[i + 1] = el;
                }}
                onNavigate={navigate(i + 1)}
                onActivate={() => api.activate(filter.ID)}
                onRename={(name) => api.rename(filter.ID, name)}
                onSave={api.save}
                onSaveAsNew={() => setSaveOpen(true)}
                onDiscard={api.discard}
                onMove={(delta) => move(filter.ID, delta)}
                onUnpin={() => api.unpin(filter.ID)}
                onDelete={() => setDeleting(filter)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <SaveFilterPopover
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSave={api.saveAsNew}
        defaultName={active ? `${active.Name} copy` : ""}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={!canSave}
            aria-label="Save as new filter"
            title="Save as new filter"
          >
            <BookmarkPlusIcon />
          </Button>
        }
      />
      <AddFilterPopover candidates={candidates} onAdd={api.pin} />

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
