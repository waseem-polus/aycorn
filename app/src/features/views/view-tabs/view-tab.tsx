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
  ShapesIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { viewHotkey } from "@/features/views/hooks/useViewShortcuts";
import { ViewIcon } from "@/features/views/view-icon";
import { ViewSettingsPopover } from "@/features/views/view-settings-popover";
import type { BoardView } from "@/features/views/view-types";
import { cn } from "@/lib/utils";

/** Whether a tab's settings are open, and what they put in front of the user. */
export type TabEditing = { focus: "name" | "icon" | null } | null;

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
  editing: TabEditing;
  onEditingChange: (editing: TabEditing) => void;
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

  const openSettings = (focus: "name" | "icon" | null = null) => {
    setMenuOpen(false);
    onSelect();
    onEditingChange({ focus });
  };

  const setButtonRef = (el: HTMLButtonElement | null) => {
    buttonRef.current = el;
    tabRef(el);
  };

  useHotkey("Enter", () => openSettings(), {
    target: buttonRef,
    enabled: selected,
  });

  // A menu item asks for the settings, which open once the menu has finished
  // closing — sooner, the menu's teardown dismisses them.
  const pendingSettings = useRef<"name" | "icon" | null | undefined>(undefined);

  return (
    // The settings popover is a sibling of the tab, not inside it, so clicks
    // in it don't bubble into the tab's handlers.
    <Popover
      open={!!editing}
      onOpenChange={(open) => !open && onEditingChange(null)}
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
                  else if (editing) onEditingChange(null);
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

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            {/* Invisible anchor so the menu lines up with the whole tab. */}
            <DropdownMenuTrigger asChild>
              <span className="pointer-events-none absolute inset-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                if (pendingSettings.current !== undefined) {
                  const focus = pendingSettings.current;
                  pendingSettings.current = undefined;
                  openSettings(focus);
                } else {
                  buttonRef.current?.focus();
                }
              }}
            >
              <DropdownMenuItem
                onSelect={() => (pendingSettings.current = null)}
              >
                <Settings2Icon />
                Edit View
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => (pendingSettings.current = "name")}
              >
                <PencilIcon />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => (pendingSettings.current = "icon")}
              >
                <ShapesIcon />
                Change icon
              </DropdownMenuItem>
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
          focus={editing.focus}
          onDuplicate={() => {
            onEditingChange(null);
            onDuplicate();
          }}
          onDelete={() => {
            onEditingChange(null);
            onDelete();
          }}
        />
      )}
    </Popover>
  );
}
