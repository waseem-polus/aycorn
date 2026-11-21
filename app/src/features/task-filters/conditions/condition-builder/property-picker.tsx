import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { PropertyIcon } from "@/features/task-filters/conditions/condition-builder/property-icon";
import { PropertyList } from "@/features/task-filters/conditions/condition-builder/property-list";
import { resolveProperty } from "@/features/task-filters/conditions/condition-properties";
import type { PropertyKey } from "@/features/task-filters/conditions/condition-types";

type Props = {
  value: PropertyKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (property: PropertyKey) => void;
};

export function PropertyPicker({ value, open, onOpenChange, onSelect }: Props) {
  const { sources, linkTypes } = useConditionBuilder();
  const meta = value ? resolveProperty(value, linkTypes) : null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Property"
          className="min-w-0 flex-1 justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            {meta && <PropertyIcon icon={meta.icon} className="size-4 shrink-0" />}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={meta ? "truncate" : "truncate text-muted-foreground"}>
                  {meta?.label ?? "Property"}
                </span>
              </TooltipTrigger>
              {meta && <TooltipContent>{meta.label}</TooltipContent>}
            </Tooltip>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start" data-vaul-no-drag>
        <PropertyList
          sources={sources}
          linkTypes={linkTypes}
          selected={value}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
