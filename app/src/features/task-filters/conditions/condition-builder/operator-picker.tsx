import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  OPERATORS,
  PRESENCE_OPERATORS,
} from "@/features/task-filters/conditions/condition-operators";
import { PROPERTIES } from "@/features/task-filters/conditions/condition-properties";
import type {
  OperatorKey,
  PropertyKey,
} from "@/features/task-filters/conditions/condition-types";

type Props = {
  property: PropertyKey | null;
  value: OperatorKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (operator: OperatorKey) => void;
};

const toOption = (key: OperatorKey) => ({
  key,
  label: OPERATORS[key].label,
  description: OPERATORS[key].description,
});

export function OperatorPicker({ property, value, open, onOpenChange, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const operators = property ? PROPERTIES[property].operators : [];
  // Two unlabelled groups: comparisons, then presence checks after a separator.
  const groups = [
    {
      label: "",
      options: operators.filter((o) => !PRESENCE_OPERATORS.includes(o)).map(toOption),
    },
    {
      label: "",
      options: operators.filter((o) => PRESENCE_OPERATORS.includes(o)).map(toOption),
    },
  ].filter((g) => g.options.length > 0);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Operator"
          disabled={!property}
          className="min-w-0 flex-1 justify-between font-normal"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={value ? "truncate" : "truncate text-muted-foreground"}>
                {value ? OPERATORS[value].label : "Operator"}
              </span>
            </TooltipTrigger>
            {value && <TooltipContent>{OPERATORS[value].label}</TooltipContent>}
          </Tooltip>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        data-vaul-no-drag
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          listRef.current?.focus();
        }}
      >
        <OptionCommandList
          ref={listRef}
          groups={groups}
          selected={value ? [value] : []}
          onSelect={(key) => onSelect(key as OperatorKey)}
          searchable={false}
        />
      </PopoverContent>
    </Popover>
  );
}
