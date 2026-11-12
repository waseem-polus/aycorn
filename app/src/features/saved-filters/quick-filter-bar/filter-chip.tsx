import { useRef, useState, type Ref } from "react";
import { useFormatForDisplay } from "@tanstack/react-hotkeys";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinOffIcon,
  SaveIcon,
  SavePlusIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditKeys } from "@/hooks/useEditKeys";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { quickFilterHotkey } from "@/features/saved-filters/hooks/useQuickFilterShortcuts";
import type { QuickFiltersAPI } from "@/features/saved-filters/hooks/useQuickFilters";
import { QuickFilterEditPopover } from "@/features/saved-filters/quick-filter-bar/quick-filter-edit-popover";
import { SavedFilterLabel } from "@/features/saved-filters/saved-filter-label";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { cn } from "@/lib/utils";

/** Which part of a chip's editor is open: the editor, optionally with its Save as new form. */
export type ChipEditing = { saveAs: boolean } | null;

type Props = {
  filter: SavedFilter;
  api: QuickFiltersAPI;
  sources: ConditionOptionSources;
  /** 1-based Alt shortcut, or null past 9. */
  shortcut: number | null;
  focusable: boolean;
  isFirst: boolean;
  isLast: boolean;
  editing: ChipEditing;
  /** Takes an updater too, for changes that land after an await. */
  onEditingChange: (next: ChipEditing | ((prev: ChipEditing) => ChipEditing)) => void;
  /** Whether the name is being edited inline on the chip. */
  renaming: boolean;
  onRenamingChange: (renaming: boolean) => void;
  chipRef: Ref<HTMLButtonElement>;
  /** Makes this chip the toolbar's tab stop. */
  onFocus: () => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
};

/**
 * One pinned quick filter: a toggle (any number can be on at once), drag to
 * reorder (the whole chip, after 4px), and a ⋯ menu. Edit opens the filter's
 * conditions in a popover anchored to the chip.
 */
export function FilterChip({
  filter,
  api,
  sources,
  shortcut,
  focusable,
  isFirst,
  isLast,
  editing,
  onEditingChange,
  renaming,
  onRenamingChange,
  chipRef,
  onFocus,
  onMove,
  onDelete,
}: Props) {
  const [name, setName] = useState(filter.Name);
  const cancelledRename = useRef(false);
  const format = useFormatForDisplay();
  const renameRef = useEditKeys({
    onEnter: () => commitRename(),
    onEscape: () => {
      cancelledRename.current = true;
      onRenamingChange(false);
    },
    enabled: renaming,
  });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.ID });
  const active = api.isActive(filter.ID);
  const edited = api.isEdited(filter);

  const startRename = () => {
    setName(filter.Name);
    cancelledRename.current = false;
    onRenamingChange(true);
  };
  const commitRename = () => {
    onRenamingChange(false);
    if (cancelledRename.current) return;
    if (name.trim() && name.trim() !== filter.Name) void api.rename(filter.ID, name.trim());
  };

  /** Editing previews live, so it turns the filter on. */
  const openEditor = (saveAs = false) => {
    api.setActive(filter.ID, true);
    onEditingChange({ saveAs });
  };

  // A menu item asks for the editor, which opens once the menu has finished
  // closing — opened sooner, the menu's teardown (returning focus to its
  // trigger) reads as an interaction outside the editor and dismisses it.
  const pendingEditor = useRef<{ saveAs: boolean } | null>(null);
  // Likewise for rename: the input must not be stolen from by the menu's focus return.
  const pendingRename = useRef(false);
  const requestEditor = (saveAs = false) => {
    pendingEditor.current = { saveAs };
  };

  return (
    // The editor is a sibling of the toggle, not inside it: portal'd clicks
    // bubble through the React tree and would toggle the filter.
    <Popover open={!!editing} onOpenChange={(open) => !open && onEditingChange(null)}>
      <PopoverAnchor asChild>
        <div
          ref={setNodeRef}
          data-task-card=""
          style={{ transform: CSS.Translate.toString(transform), transition }}
          className={cn(
            "group flex h-8 shrink-0 items-center rounded-md border text-sm transition-colors",
            active
              ? "border-primary/40 bg-accent text-accent-foreground"
              : "bg-background hover:bg-accent/50",
            isDragging && "z-10 opacity-80 shadow-md",
          )}
        >
          {renaming ? (
            <Input
              ref={renameRef}
              autoFocus
              value={name}
              aria-label="Filter name"
              className="h-7 w-40 border-0 shadow-none focus-visible:ring-0"
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => e.stopPropagation()}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  {...attributes}
                  {...listeners}
                  ref={chipRef}
                  type="button"
                  aria-pressed={active}
                  tabIndex={focusable ? 0 : -1}
                  className="flex h-full min-w-0 max-w-48 cursor-pointer items-center rounded-l-md pl-2.5 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => api.toggle(filter.ID)}
                  onFocus={onFocus}
                  onDoubleClick={startRename}
                >
                  <SavedFilterLabel filter={filter} edited={edited} tooltip={false} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-3">
                {filter.Name}
                {shortcut !== null && (
                  <Kbd>{format(quickFilterHotkey(shortcut))}</Kbd>
                )}
              </TooltipContent>
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
                  !active &&
                    !edited &&
                    "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                )}
              >
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              // Focus goes to the editor, not back to the menu trigger.
              onCloseAutoFocus={(e) => {
                if (pendingRename.current) {
                  pendingRename.current = false;
                  e.preventDefault();
                  startRename();
                  return;
                }
                const pending = pendingEditor.current;
                if (!pending) return;
                pendingEditor.current = null;
                e.preventDefault();
                openEditor(pending.saveAs);
              }}
            >
              <DropdownMenuItem onSelect={() => requestEditor()}>
                <SlidersHorizontalIcon />
                Edit…
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => (pendingRename.current = true)}>
                <PencilIcon />
                Rename
              </DropdownMenuItem>
              {edited && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void api.save(filter.ID)}>
                    <SaveIcon />
                    Save changes
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => requestEditor(true)}>
                    <SavePlusIcon />
                    Save as new…
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => api.discard(filter.ID)}>
                    <Undo2Icon />
                    Discard changes
                  </DropdownMenuItem>
                </>
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
              <DropdownMenuItem onSelect={() => void api.unpin(filter.ID)}>
                <PinOffIcon />
                Unpin Filter
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PopoverAnchor>

      {editing && (
        <QuickFilterEditPopover
          filter={filter}
          api={api}
          sources={sources}
          saveAsOpen={editing.saveAs}
          onSaveAsOpenChange={(saveAs) => onEditingChange((prev) => prev && { ...prev, saveAs })}
          onClose={() => onEditingChange(null)}
        />
      )}
    </Popover>
  );
}
