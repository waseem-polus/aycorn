import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { ViewMenuBody } from "@/features/views/view-menu/view-menu-body";
import type { BoardView } from "@/features/views/view-types";

type Props = {
  view: BoardView;
  api: BoardViewsAPI;
  sources: ConditionOptionSources;
  isFirst: boolean;
  isLast: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** The element the menu hangs from: a tab, the settings button, … */
  trigger: React.ReactElement;
  align?: "start" | "center" | "end";
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * A view's menu — name and icon, Layout, Group by, Sort, Filter, move,
 * duplicate and delete — the same wherever it's opened from. Controlled, so
 * the tab strip and the toolbar button can share one (see `ViewMenuProvider`).
 *
 * `modal={false}` so the flyouts, which are popovers opened from its rows,
 * stay interactive (see `IconColorPickerMenuItem`).
 */
export function ViewMenu({
  trigger,
  open,
  onOpenChange,
  align = "start",
  onCloseAutoFocus,
  ...body
}: Props) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-64"
        onCloseAutoFocus={onCloseAutoFocus}
        // Closes on a click away or Escape, not when the page moves focus
        // (picking a layout mounts a view that grabs it).
        onFocusOutside={(e) => e.preventDefault()}
        // A click on a toast (e.g. Undo after clearing conditions) isn't a click
        // away, and neither is one on what toggles the menu — that click
        // closes it itself.
        onInteractOutside={(e) => {
          if (
            (e.target as Element | null)?.closest(
              "[data-sonner-toaster], [data-view-settings-toggle]",
            )
          ) {
            e.preventDefault();
          }
        }}
        // ↑ from the first row goes back up to the name.
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp") return;
          const menu = e.currentTarget;
          const first = menu.querySelector(
            '[role="menuitem"]:not([data-disabled])',
          );
          if (e.target !== first) return;
          e.preventDefault();
          menu.querySelector<HTMLInputElement>("input")?.focus();
        }}
      >
        <ViewMenuBody {...body} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
