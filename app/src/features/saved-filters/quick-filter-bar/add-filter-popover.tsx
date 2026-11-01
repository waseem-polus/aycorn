import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

type Props = {
  /** Saved filters not yet on this board. */
  candidates: SavedFilter[];
  onAdd: (id: number) => void;
};

/** [+] on the bar: pin an existing saved filter to this board. */
export function AddFilterPopover({ candidates, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Add a saved filter">
              <PlusIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add a saved filter</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-64 p-0" align="start">
        {candidates.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            Every saved filter is already on this board. Save the current filters to create a new one.
          </p>
        ) : (
          <OptionCommandList
            options={candidates.map((f) => ({
              key: f.ID,
              label: f.Name,
              sublabel: f.Pins.length ? `${f.Pins.length} board${f.Pins.length === 1 ? "" : "s"}` : undefined,
            }))}
            selected={[]}
            searchPlaceholder="Search filters…"
            onSelect={(id) => {
              setOpen(false);
              onAdd(Number(id));
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
