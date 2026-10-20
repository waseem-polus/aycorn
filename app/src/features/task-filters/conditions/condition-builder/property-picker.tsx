import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import {
  PROPERTIES,
  PROPERTY_KEYS,
  PROPERTY_SECTIONS,
} from "@/features/task-filters/conditions/condition-properties";
import type { PropertyKey } from "@/features/task-filters/conditions/condition-types";

type Props = {
  value: PropertyKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (property: PropertyKey) => void;
};

export function PropertyPicker({ value, open, onOpenChange, onSelect }: Props) {
  const { sources } = useConditionBuilder();
  // Enum properties need values to pick from; without a source on this
  // surface they aren't offered.
  const available = PROPERTY_KEYS.filter(
    (key) => PROPERTIES[key].valueKind !== "enum" || sources[key],
  );
  const groups = PROPERTY_SECTIONS.map((section) => ({
    label: section,
    options: available
      .filter((key) => PROPERTIES[key].section === section)
      .map((key) => {
        const Icon = PROPERTIES[key].icon;
        return {
          key,
          label: PROPERTIES[key].label,
          lead: <Icon className="size-4 shrink-0 text-muted-foreground" />,
        };
      }),
  })).filter((g) => g.options.length > 0);

  const meta = value ? PROPERTIES[value] : null;

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
            {meta && <meta.icon className="size-4 shrink-0 text-muted-foreground" />}
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
        <OptionCommandList
          groups={groups}
          selected={value ? [value] : []}
          onSelect={(key) => onSelect(key as PropertyKey)}
          searchPlaceholder="Search properties…"
        />
      </PopoverContent>
    </Popover>
  );
}
