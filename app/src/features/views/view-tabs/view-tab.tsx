import { useRef, type KeyboardEvent, type Ref } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  MoreHorizontalIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { ViewIcon } from "@/features/views/view-icon";
import { ViewSettingsPopover } from "@/features/views/view-settings-popover";
import type { BoardView } from "@/features/views/view-types";
import { cn } from "@/lib/utils";

/** Whether a tab's settings are open, and whether the name should take focus. */
export type TabEditing = { focusName: boolean } | null;

type Props = {
  view: BoardView;
  api: BoardViewsAPI;
  sources: ConditionOptionSources;
  selected: boolean;
  focusable: boolean;
  /** 1-based Alt+Shift shortcut, or null past 9. */
  shortcut: number | null;
  isFirst: boolean;
  isLast: boolean;
  editing: TabEditing;
  onEditingChange: (editing: TabEditing) => void;
  tabRef: Ref<HTMLButtonElement>;
  onSelect: () => void;
  onNavigate: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

/**
 * One view on the board's tab strip: selects on click, drags to reorder
 * (after 4px), and opens its settings from the ⋯ menu, a double-click, or
 * Enter on the selected tab.
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
  onNavigate,
  onFocus,
  onMove,
  onDuplicate,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: view.ID });

  const openSettings = () => {
    onSelect();
    onEditingChange({ focusName: false });
  };

  // A menu item asks for the settings, which open once the menu has finished
  // closing — sooner, the menu's teardown dismisses them.
  const pendingSettings = useRef(false);

  return (
    // The settings popover is a sibling of the tab, not inside it, so clicks
    // in it don't bubble into the tab's handlers.
    <Popover open={!!editing} onOpenChange={(open) => !open && onEditingChange(null)}>
      <PopoverAnchor asChild>
        <div
          ref={setNodeRef}
          data-task-card=""
          style={{ transform: CSS.Translate.toString(transform), transition }}
          className={cn(
            "group flex h-8 shrink-0 items-center rounded-md text-sm transition-colors",
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
                ref={tabRef}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={focusable ? 0 : -1}
                className="flex h-full min-w-0 max-w-48 cursor-pointer items-center gap-1.5 rounded-md pl-2.5 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onSelect}
                onDoubleClick={openSettings}
                onFocus={onFocus}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selected) {
                    e.preventDefault();
                    openSettings();
                  } else {
                    onNavigate(e);
                  }
                }}
              >
                <ViewIcon view={view} />
                <span className="truncate">{view.Name}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {view.Name}
              {shortcut !== null && ` · Alt+Shift+${shortcut}`}
            </TooltipContent>
          </Tooltip>

          {selected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  aria-label={`${view.Name} options`}
                  className="mr-0.5 size-6 shrink-0 text-muted-foreground"
                >
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                onCloseAutoFocus={(e) => {
                  if (!pendingSettings.current) return;
                  pendingSettings.current = false;
                  e.preventDefault();
                  openSettings();
                }}
              >
                <DropdownMenuItem onSelect={() => (pendingSettings.current = true)}>
                  <Settings2Icon />
                  Edit view…
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
          )}
        </div>
      </PopoverAnchor>

      {editing && (
        <ViewSettingsPopover
          view={view}
          api={api}
          sources={sources}
          focusName={editing.focusName}
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
