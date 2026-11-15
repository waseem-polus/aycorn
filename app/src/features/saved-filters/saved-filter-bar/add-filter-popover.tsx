import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SavedFilterLabel } from "@/features/saved-filters/saved-filter-label";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

type Props = {
  /** Saved filters not yet on this board. */
  candidates: SavedFilter[];
  onAdd: (id: number) => void;
  /** Creates an empty saved filter here and opens its editor. */
  onCreate: () => void;
};

/** [+] on the bar: start a new saved filter, or pin an existing one. */
export function AddFilterPopover({ candidates, onAdd, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="shrink-0 text-muted-foreground"
              aria-label="Add a saved filter"
            >
              <PlusIcon />
              Saved filter
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add a saved filter</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          {candidates.length > 0 && (
            <CommandInput placeholder="Search filters…" />
          )}
          <CommandList>
            <CommandEmpty>No filters found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__new"
                keywords={["new", "create"]}
                onSelect={() => {
                  setOpen(false);
                  onCreate();
                }}
              >
                <PlusIcon />
                New saved filter
              </CommandItem>
            </CommandGroup>
            {candidates.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Saved filters">
                  {candidates.map((f) => (
                    <CommandItem
                      key={f.ID}
                      value={`${f.ID}`}
                      keywords={[f.Name]}
                      onSelect={() => {
                        setOpen(false);
                        onAdd(f.ID);
                      }}
                    >
                      <SavedFilterLabel filter={f} />
                      {f.Pins.length > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {f.Pins.length} board{f.Pins.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
