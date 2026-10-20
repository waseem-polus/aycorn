import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptionCommandList } from "@/components/ui/option-command-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MultiSelectOption = {
  key: string | number;
  label: string;
  sublabel?: string;
  /** A second, muted line under the label. */
  description?: string;
  lead?: React.ReactNode;
};

export type MultiSelectOptionGroup = {
  label: string;
  options: MultiSelectOption[];
};

type Props = {
  label: string;
  icon: string;
  options?: MultiSelectOption[];
  groups?: MultiSelectOptionGroup[];
  selected: (string | number)[];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function MultiSelectCombobox({
  label,
  icon,
  options,
  groups,
  selected,
  onToggle,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false);

  const allOptions = groups
    ? groups.flatMap((g) => g.options)
    : (options ?? []);

  const count = selected.length;

  return (
    <div className="flex flex-col gap-1.5">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="flex items-center gap-2 min-w-0">
              <DynamicIcon
                name={icon as IconName}
                className="size-4 shrink-0 text-muted-foreground"
                fallback={() => <span className="size-4" />}
              />
              <span className="truncate text-muted-foreground">{label}</span>
            </span>
            {count > 0 ? (
              <span className="flex gap-2 items-center justify-end">
                <Badge variant="secondary" className="ml-1 text-xs shrink-0">
                  {count}
                </Badge>
                <span
                  role="button"
                  aria-label={`Clear ${label} filter`}
                  className="ml-auto rounded-full p-0.5 hover:bg-muted-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  <X className="size-3.5" />
                </span>
              </span>
            ) : (
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0" align="start" data-vaul-no-drag>
          <OptionCommandList
            options={options}
            groups={groups}
            selected={selected}
            onSelect={onToggle}
            searchPlaceholder={`Search ${label.toLowerCase()}…`}
          />
        </PopoverContent>
      </Popover>

      {count > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((key) => {
            const option = allOptions.find((o) => o.key === key);
            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pl-1.5 pr-1 py-0.5 text-xs"
              >
                {option?.lead}
                <span className="max-w-24 truncate">
                  {option?.label ?? String(key)}
                </span>
                <button
                  onClick={() => onToggle(key)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${option?.label ?? key}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
