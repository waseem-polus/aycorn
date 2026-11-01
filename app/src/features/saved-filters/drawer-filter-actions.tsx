import { useState } from "react";
import { SavePlusIcon, SaveIcon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";
import { SavedFilterLabel } from "@/features/saved-filters/saved-filter-label";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** The drawer header title: the active saved filter (with its edited dot), or plain "Filters". */
export function DrawerFilterTitle({ api }: { api: BoardFilterAPI }) {
  if (!api.active) return <>Filters</>;
  return (
    <SavedFilterLabel
      filter={api.active}
      edited={api.isDirty}
      className="max-w-72"
    />
  );
}

/**
 * Commit controls in the drawer footer. A saved filter with edits offers
 * Save / Discard / Save as new; a non-empty scratch filter offers Save as
 * filter. Shared filters are committed explicitly (not auto-saved) so tweaks
 * on one board don't silently change every board using them.
 */
export function DrawerFilterActions({ api }: { api: BoardFilterAPI }) {
  const [saveOpen, setSaveOpen] = useState(false);
  const { active, isDirty } = api;
  const hasFilters = api.activeFilterCount() > 0;
  if (active ? !isDirty : !hasFilters) return null;

  const saveAsNew = (
    <SaveFilterPopover
      open={saveOpen}
      onOpenChange={setSaveOpen}
      onSave={api.saveAsNew}
      align="start"
      defaultName={active ? `${active.Name} copy` : ""}
      trigger={
        <Button
          variant={active ? "outline" : "default"}
          className={active ? "" : "w-full"}
        >
          <SavePlusIcon />
          {active ? "Save as new" : "Save as filter…"}
        </Button>
      }
    />
  );

  if (!active) return saveAsNew;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Tooltip>
        <TooltipTrigger>
          <Button onClick={api.save} size="icon">
            <SaveIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save changes to the filter</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline" onClick={api.discard} size="icon">
            <Undo2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Discard unsaved filter changes</TooltipContent>
      </Tooltip>
      {saveAsNew}
    </div>
  );
}
