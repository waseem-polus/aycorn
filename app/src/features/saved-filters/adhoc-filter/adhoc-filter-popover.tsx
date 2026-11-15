import { useState } from "react";
import { useHotkey, useFormatForDisplay } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";
import { FilterIcon, SavePlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { useConditionTree } from "@/features/task-filters/conditions/hooks/useConditionTree";

/** Opens the Filter popover. Also drives the button's tooltip hint. */
export const adhocFilterHotkey = "Alt+F" as Hotkey;

type Props = {
  api: BoardFilterAPI;
  sources: ConditionOptionSources;
};

/**
 * The toolbar's Filter button: opens the condition builder on the view's
 * unsaved ad hoc tree, so filtering needs no name and nothing saved. Edits
 * apply live; "Save as filter" promotes the tree to a pinned quick filter.
 */
export function AdhocFilterPopover({ api, sources }: Props) {
  const adhoc = api.adhocConditions;
  const tree = useConditionTree(adhoc.tree, adhoc.update);
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const format = useFormatForDisplay();

  const changeOpen = (next: boolean) => {
    setOpen(next);
    // Start with a blank condition, its property picker already open.
    if (next && tree.root.children.length === 0) tree.addCondition(tree.root.id);
    // Don't leave an untouched blank row behind.
    if (!next && tree.completeCount === 0) adhoc.clear();
  };

  useHotkey(adhocFilterHotkey, () => changeOpen(!open));

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild>
        <div className="flex shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={adhoc.count > 0 ? "rounded-r-none" : undefined}
                  aria-label="Filter tasks"
                >
                  <FilterIcon />
                  Filter
                  {adhoc.count > 0 && <Badge variant="secondary">{adhoc.count}</Badge>}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-3">
              Filter tasks
              <Kbd>{format(adhocFilterHotkey)}</Kbd>
            </TooltipContent>
          </Tooltip>

          {adhoc.count > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="-ml-px rounded-l-none px-2 text-muted-foreground"
              aria-label="Clear filter"
              onClick={() => {
                tree.clearAll();
                setOpen(false);
              }}
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="flex w-[36rem] max-w-[calc(100vw-2rem)] max-h-[70vh] flex-col gap-4 overflow-y-auto"
        // Clicking a toast (e.g. Undo after clearing conditions) isn't a
        // click away from the editor.
        onInteractOutside={(e) => {
          if ((e.target as Element | null)?.closest("[data-sonner-toaster]")) {
            e.preventDefault();
          }
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ConditionBuilder tree={tree} sources={sources} />

        <SaveFilterPopover
          open={saveOpen}
          onOpenChange={setSaveOpen}
          onSave={async (name) => {
            await api.saveAdhocConditionsAsQuickFilter(name);
            setOpen(false);
          }}
          align="start"
          trigger={
            <Button variant="secondary" size="sm" disabled={adhoc.count === 0}>
              <SavePlusIcon />
              Save as filter
            </Button>
          }
        />
      </PopoverContent>
    </Popover>
  );
}
