import { useState, type KeyboardEvent, type Ref } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkPlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinOffIcon,
  SaveIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SavedFilterLabel } from "@/features/saved-filters/saved-filter-label";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { cn } from "@/lib/utils";

type Props = {
  filter: SavedFilter;
  active: boolean;
  edited: boolean;
  /** 1-based Alt shortcut, or null past 9. */
  shortcut: number | null;
  focusable: boolean;
  isFirst: boolean;
  isLast: boolean;
  chipRef: Ref<HTMLButtonElement>;
  onNavigate: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onActivate: () => void;
  onRename: (name: string) => void;
  onSave: () => void;
  onSaveAsNew: () => void;
  onDiscard: () => void;
  onMove: (delta: -1 | 1) => void;
  onUnpin: () => void;
  onDelete: () => void;
};

/**
 * One pinned filter on the quick-filter bar: a tab that activates it, drags
 * to reorder (the whole chip, after 4px), and carries a ⋯ menu. F2 renames in
 * place, Delete unpins.
 */
export function FilterChip({
  filter,
  active,
  edited,
  shortcut,
  focusable,
  isFirst,
  isLast,
  chipRef,
  onNavigate,
  onActivate,
  onRename,
  onSave,
  onSaveAsNew,
  onDiscard,
  onMove,
  onUnpin,
  onDelete,
}: Props) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(filter.Name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: filter.ID });

  const startRename = () => {
    setName(filter.Name);
    setRenaming(true);
  };
  const commitRename = () => {
    setRenaming(false);
    if (name.trim() && name.trim() !== filter.Name) onRename(name.trim());
  };

  return (
    <div
      ref={setNodeRef}
      data-task-card=""
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex h-8 shrink-0 items-center rounded-md border text-sm transition-colors",
        active ? "border-primary/40 bg-accent text-accent-foreground" : "bg-background hover:bg-accent/50",
        isDragging && "z-10 opacity-80 shadow-md",
      )}
    >
      {renaming ? (
        <Input
          autoFocus
          value={name}
          aria-label="Filter name"
          className="h-7 w-40 border-0 shadow-none focus-visible:ring-0"
          onChange={(e) => setName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              {...attributes}
              {...listeners}
              ref={chipRef}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={focusable ? 0 : -1}
              className="flex h-full min-w-0 max-w-48 cursor-pointer items-center rounded-l-md pl-2.5 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onActivate}
              onDoubleClick={startRename}
              onKeyDown={(e) => {
                if (e.key === "F2") {
                  e.preventDefault();
                  startRename();
                } else if (e.key === "Delete") {
                  e.preventDefault();
                  onUnpin();
                } else {
                  onNavigate(e);
                }
              }}
            >
              <SavedFilterLabel filter={filter} edited={edited} />
            </button>
          </TooltipTrigger>
          {shortcut !== null && <TooltipContent>Alt+{shortcut}</TooltipContent>}
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            tabIndex={-1}
            aria-label={`${filter.Name} actions`}
            className={cn(
              "size-6 shrink-0 mr-0.5 text-muted-foreground",
              !active && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={startRename}>
            <PencilIcon />
            Rename
            <DropdownMenuShortcut>F2</DropdownMenuShortcut>
          </DropdownMenuItem>
          {active && edited && (
            <>
              <DropdownMenuItem onSelect={onSave}>
                <SaveIcon />
                Save changes
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDiscard}>
                <Undo2Icon />
                Discard changes
              </DropdownMenuItem>
            </>
          )}
          {active && (
            <DropdownMenuItem onSelect={onSaveAsNew}>
              <BookmarkPlusIcon />
              Save as new…
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isFirst} onSelect={() => onMove(-1)}>
            <ArrowLeftIcon />
            Move left
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLast} onSelect={() => onMove(1)}>
            <ArrowRightIcon />
            Move right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onUnpin}>
            <PinOffIcon />
            Remove from this board
            <DropdownMenuShortcut>Del</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2Icon />
            Delete filter…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
