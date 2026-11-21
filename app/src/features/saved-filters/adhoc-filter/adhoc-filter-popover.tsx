import { useState } from "react";
import { useHotkey, useFormatForDisplay } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";
import { FilterIcon, SavePlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";
import { cn } from "@/lib/utils";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { PropertyList } from "@/features/task-filters/conditions/condition-builder/property-list";
import { useConditionTree } from "@/features/task-filters/conditions/hooks/useConditionTree";
import { useLinkConditionData } from "@/features/task-filters/conditions/hooks/useLinkConditionData";

/** Opens the Filter popover. Also drives the button's tooltip hint. */
export const adhocFilterHotkey = "Alt+F" as Hotkey;

type Props = {
  api: BoardFilterAPI;
  sources: ConditionOptionSources;
};

/**
 * The toolbar's Filter button: opens the condition builder on the view's
 * unsaved ad hoc tree, so filtering needs no name and nothing saved. Edits
 * apply live; "Save filter" promotes the tree to a pinned saved filter.
 *
 * Opened with no conditions it's just the property list; picking one adds
 * the first condition and the full editor takes over. Clearing every
 * condition keeps the editor (with its empty message) until it closes.
 */
export function AdhocFilterPopover({ api, sources }: Props) {
  const adhoc = api.adhocConditions;
  const tree = useConditionTree(adhoc.tree, adhoc.update);
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  // Opened with nothing to edit: show only the property list.
  const [bare, setBare] = useState(false);
  const { linkTypes } = useLinkConditionData();
  const format = useFormatForDisplay();

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) setBare(tree.root.children.length === 0);
    // Don't leave an untouched blank row behind.
    if (!next && tree.completeCount === 0) adhoc.clear();
  };

  useHotkey(adhocFilterHotkey, () => changeOpen(!open));

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild>
        <div className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "relative",
                    adhoc.count > 0 &&
                      // The outline variant's dark styles win unless overridden too.
                      "border-primary/40 bg-accent text-accent-foreground dark:border-primary/40 dark:bg-accent dark:hover:bg-accent",
                  )}
                  aria-label="Filter tasks"
                >
                  <FilterIcon />
                  Filter
                  {adhoc.count > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                      {adhoc.count}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-3">
              Filter tasks
              <Kbd>{format(adhocFilterHotkey)}</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className={
          bare
            ? "w-60 p-0"
            : "flex w-[36rem] max-w-[calc(100vw-2rem)] max-h-[70vh] flex-col gap-4 overflow-y-auto"
        }
        // Clicking a toast (e.g. Undo after clearing conditions) isn't a
        // click away from the editor.
        onInteractOutside={(e) => {
          if ((e.target as Element | null)?.closest("[data-sonner-toaster]")) {
            e.preventDefault();
          }
        }}
        // The bare property list takes focus so you can type to search; the
        // full editor leaves it where it was.
        onOpenAutoFocus={(e) => {
          if (!bare) e.preventDefault();
        }}
      >
        {bare ? (
          <PropertyList
            sources={sources}
            linkTypes={linkTypes}
            onSelect={(property) => {
              // The new condition opens its operator picker next.
              tree.addCondition(tree.root.id, property);
              setBare(false);
            }}
          />
        ) : (
          <>
            <ConditionBuilder tree={tree} sources={sources} />

            <SaveFilterPopover
              open={saveOpen}
              onOpenChange={setSaveOpen}
              onSave={async (name) => {
                await api.saveAdhocConditionsAsSavedFilter(name);
                setOpen(false);
              }}
              align="start"
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={adhoc.count === 0}
                >
                  <SavePlusIcon />
                  Save filter
                </Button>
              }
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
