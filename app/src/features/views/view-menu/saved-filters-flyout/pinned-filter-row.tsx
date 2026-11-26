import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedFilterLabel } from "@/features/saved-filters/saved-filter-label";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { cn } from "@/lib/utils";

type Props = {
  filter: SavedFilter;
  onRemove: () => void;
};

/** One of a view's pinned saved filters: a drag grip, its name, and remove. */
export function PinnedFilterRow({ filter, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.ID });

  return (
    <div
      ref={setNodeRef}
      data-task-card=""
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-popover",
        isDragging && "z-10 opacity-80 shadow",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        data-drag-handle=""
        style={{ touchAction: "none" }}
        className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
        aria-label={`Reorder ${filter.Name}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <SavedFilterLabel filter={filter} className="flex-1 text-sm" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={`Remove ${filter.Name} from this view`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </div>
  );
}
