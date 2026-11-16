import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { viewHotkey } from "@/features/views/hooks/useViewShortcuts";
import { ViewIcon } from "@/features/views/view-icon";
import { ViewMenu } from "@/features/views/view-menu";
import { useViewMenuState } from "@/features/views/view-menu-context";
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
  /** Doesn't fit the strip: stays mounted (so it can be measured) but unseen. */
  overflowed: boolean;
  /** Whether the name is being edited inline in the tab (a just-created view). */
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
 * (after 4px), and opens its menu (see `ViewMenu`) on a right-click, a click
 * on the already-selected tab, or Enter. A just-created view's name is edited
 * inline in the tab; after that, in the menu.
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
  overflowed,
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
  const menuState = useViewMenuState();
  const menuOpen =
    menuState.openMenu?.viewId === view.ID &&
    menuState.openMenu.anchor === "tab";
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const openMenu = () => menuState.open(view.ID, "tab");
  const closeMenu = () => menuState.close(view.ID, "tab");

  const [name, setName] = useState(view.Name);
  const cancelledRename = useRef(false);

  const commitRename = () => {
    onRenamingChange(false);
    // Hand focus back to the tab once the input has gone.
    requestAnimationFrame(() => buttonRef.current?.focus());
    const trimmed = name.trim();
    const cancelled = cancelledRename.current;
    cancelledRename.current = false;
    if (cancelled || !trimmed || trimmed === view.Name) return;
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

  useHotkey("Enter", () => openMenu(), {
    target: buttonRef,
    enabled: selected && !renaming,
  });

  return (
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
        overflowed && "pointer-events-none invisible absolute",
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
                else if (menuOpen) closeMenu();
                else openMenu();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onSelect();
                openMenu();
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

      <ViewMenu
        view={view}
        api={api}
        sources={sources}
        isFirst={isFirst}
        isLast={isLast}
        open={menuOpen}
        onOpenChange={(open) => (open ? openMenu() : closeMenu())}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        // Invisible anchor so the menu lines up with the whole tab.
        trigger={<span className="pointer-events-none absolute inset-0" />}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          buttonRef.current?.focus();
        }}
      />
    </div>
  );
}
