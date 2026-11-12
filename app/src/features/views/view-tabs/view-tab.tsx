import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  PencilIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconColorPickerMenuItem } from "@/features/icon-picker/icon-color-picker-menu-item";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { viewHotkey } from "@/features/views/hooks/useViewShortcuts";
import { ViewIcon } from "@/features/views/view-icon";
import { ViewSettingsPopover } from "@/features/views/view-settings-popover";
import type { BoardView } from "@/features/views/view-types";
import { useEditKeys } from "@/hooks/useEditKeys";
import { cn } from "@/lib/utils";

type Props = {
  view: BoardView;
  api: BoardViewsAPI;
  sources: ConditionOptionSources;
  selected: boolean;
  focusable: boolean;
  /** 1-based position shortcut (see `viewHotkey`), or null past 9. */
  shortcut: number | null;
  isFirst: boolean;
  isLast: boolean;
  /** Whether the tab's settings popover is open. */
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  /** Whether the name is being edited inline in the tab. */
  renaming: boolean;
  onRenamingChange: (renaming: boolean) => void;
  tabRef: (el: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onFocus: () => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

/**
 * One view on the board's tab strip: selects on click, drags to reorder
 * (after 4px), opens its context menu on a right-click, and toggles its
 * settings from a click on the already-selected tab, Enter, or the menu.
 * Rename edits the name in the tab; Change icon opens the icon picker from
 * the menu.
 */
export function ViewTab({
  view,
  api,
  sources,
  selected,
  focusable,
  shortcut,
  isFirst,
  isLast,
  editing,
  onEditingChange,
  renaming,
  onRenamingChange,
  tabRef,
  onSelect,
  onFocus,
  onMove,
  onDuplicate,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: view.ID });

  const format = useFormatForDisplay();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const openSettings = () => {
    setMenuOpen(false);
    onSelect();
    onEditingChange(true);
  };

  const [name, setName] = useState(view.Name);
  const cancelledRename = useRef(false);

  const startRename = () => {
    setMenuOpen(false);
    onSelect();
    onEditingChange(false);
    setName(view.Name);
    cancelledRename.current = false;
    onRenamingChange(true);
  };

  const commitRename = () => {
    onRenamingChange(false);
    // Hand focus back to the tab once the input has gone.
    requestAnimationFrame(() => buttonRef.current?.focus());
    const trimmed = name.trim();
    if (cancelledRename.current || !trimmed || trimmed === view.Name) return;
    void api.update(view.ID, { name: trimmed });
  };

  const nameRef = useEditKeys({
    onEnter: (input) => input.blur(),
    onEscape: (input) => {
      cancelledRename.current = true;
      input.blur();
    },
    enabled: renaming,
  });

  const setButtonRef = (el: HTMLButtonElement | null) => {
    buttonRef.current = el;
    tabRef(el);
  };

  useHotkey("Enter", () => openSettings(), {
    target: buttonRef,
    enabled: selected && !renaming,
  });

  // A menu item asks for the settings or the rename, which start once the menu
  // has finished closing — sooner, its teardown dismisses them (or steals focus).
  const pendingAction = useRef<"settings" | "rename" | null>(null);

  return (
    // The settings popover is a sibling of the tab, not inside it, so clicks
    // in it don't bubble into the tab's handlers.
    <Popover
      open={editing}
      onOpenChange={(open) => !open && onEditingChange(false)}
    >
      <PopoverAnchor asChild>
        <div
          ref={setNodeRef}
          data-task-card=""
          data-view-settings-toggle=""
          style={{ transform: CSS.Translate.toString(transform), transition }}
          className={cn(
            "group relative flex h-8 shrink-0 items-center rounded-md text-sm transition-colors",
            selected
              ? "bg-background text-foreground shadow-sm dark:bg-input/30"
              : "text-muted-foreground hover:text-foreground",
            isDragging && "z-10 opacity-80 shadow-md",
          )}
        >
          {renaming ? (
            <div className="flex h-full min-w-0 max-w-48 items-center gap-1.5 pl-2.5 pr-2">
              <ViewIcon view={view} />
              <Input
                ref={nameRef}
                autoFocus
                value={name}
                aria-label="View name"
                className="h-6 min-w-12 max-w-36 border-transparent bg-transparent px-1 py-0 text-sm shadow-none field-sizing-content focus-visible:border-input dark:bg-transparent"
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitRename}
                // Keep app-level shortcuts (tab arrows etc.) quiet while typing.
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  {...attributes}
                  {...listeners}
                  ref={setButtonRef}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={focusable ? 0 : -1}
                  className="flex h-full min-w-0 max-w-48 cursor-pointer items-center gap-1.5 rounded-md pl-2.5 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    if (!selected) onSelect();
                    else if (editing) onEditingChange(false);
                    else openSettings();
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onSelect();
                    setMenuOpen(true);
                  }}
                  onFocus={onFocus}
                >
                  <ViewIcon view={view} />
                  <span className="truncate">{view.Name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {view.Name}
                {shortcut !== null && (
                  <Kbd className="ml-2">{format(viewHotkey(shortcut))}</Kbd>
                )}
              </TooltipContent>
            </Tooltip>
          )}

          {/* modal={false} so the icon picker, which opens from a menu item,
              stays interactive (see IconColorPickerMenuItem). */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
            {/* Invisible anchor so the menu lines up with the whole tab. */}
            <DropdownMenuTrigger asChild>
              <span className="pointer-events-none absolute inset-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                const action = pendingAction.current;
                pendingAction.current = null;
                if (action === "settings") openSettings();
                else if (action === "rename") startRename();
                else buttonRef.current?.focus();
              }}
            >
              <DropdownMenuItem
                onSelect={() => (pendingAction.current = "settings")}
              >
                <Settings2Icon />
                Edit View
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => (pendingAction.current = "rename")}
              >
                <PencilIcon />
                Rename
              </DropdownMenuItem>
              <IconColorPickerMenuItem
                iconValue={view.Icon}
                colorValue={view.Color}
                onIconSelect={(icon) => void api.update(view.ID, { icon })}
                onColorSelect={(color) => void api.update(view.ID, { color })}
                onDone={() => setMenuOpen(false)}
              />
              <DropdownMenuItem onSelect={onDuplicate}>
                <CopyIcon />
                Duplicate
              </DropdownMenuItem>
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
              <DropdownMenuItem
                variant="destructive"
                disabled={api.views.length <= 1}
                onSelect={onDelete}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PopoverAnchor>

      {editing && (
        <ViewSettingsPopover
          view={view}
          api={api}
          sources={sources}
          onDuplicate={() => {
            onEditingChange(false);
            onDuplicate();
          }}
          onDelete={() => {
            onEditingChange(false);
            onDelete();
          }}
        />
      )}
    </Popover>
  );
}
