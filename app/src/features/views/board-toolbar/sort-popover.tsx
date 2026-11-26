import { useState } from "react";
import { useFormatForDisplay } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";
import { ArrowUpDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBoardToolbarRequest } from "@/features/views/board-toolbar/board-toolbar-requests";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { SortEditor } from "@/features/views/sort/sort-editor";
import { sortApplies, sortSummary } from "@/features/views/view-sorts";
import type { BoardView } from "@/features/views/view-types";
import { cn } from "@/lib/utils";

/** Opens the Sort popover. Also drives the button's tooltip hint. */
export const sortHotkey = "Alt+S" as Hotkey;

type Props = {
  api: BoardViewsAPI;
  view: BoardView | null;
};

/**
 * The toolbar's Sort button: edits the shown view's saved sort — the same
 * rules as the view menu's Sort row. Calendars order by time, so it's
 * disabled there.
 */
export function SortPopover({ api, view }: Props) {
  const [open, setOpen] = useState(false);
  const format = useFormatForDisplay();
  const enabled = view !== null && sortApplies(view.Type);
  const rules = view?.Sort ?? [];
  const active = enabled && rules.length > 0;

  // Alt+S and the command palette, via the board toolbar.
  useBoardToolbarRequest("sort", () => {
    if (enabled) setOpen((o) => !o);
  });

  return (
    <Popover open={open && enabled} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* A wrapper keeps the tooltip working while the button is disabled. */}
          <span className="shrink-0">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!enabled}
                className={cn(
                  "relative",
                  active &&
                    // The outline variant's dark styles win unless overridden too.
                    "border-primary/40 bg-accent text-accent-foreground dark:border-primary/40 dark:bg-accent dark:hover:bg-accent",
                )}
                aria-label="Sort tasks"
              >
                <ArrowUpDownIcon />
                {(active && sortSummary(rules)) || "Sort"}
                {active && rules.length > 1 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                    {rules.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-3">
          {enabled ? (
            <>
              Sort tasks
              <Kbd>{format(sortHotkey)}</Kbd>
            </>
          ) : (
            "Calendars are ordered by time"
          )}
        </TooltipContent>
      </Tooltip>

      {view && (
        // SortEditor sizes itself: a bare property list when empty, the rule editor otherwise.
        <PopoverContent align="start" className="w-auto p-0">
          <SortEditor
            view={view}
            board={api.board}
            onChange={(sort) => void api.update(view.ID, { sort })}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
