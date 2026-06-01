import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  key: string | number;
  label: string;
  sublabel?: string;
  lead?: React.ReactNode;
};

type Props = {
  label: string;
  icon: string;
  options: MultiSelectOption[];
  selected: (string | number)[];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function MultiSelectCombobox({
  label,
  icon,
  options,
  selected,
  onToggle,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const ql = query.trim().toLowerCase();
  const shown = ql
    ? options.filter(
        (o) =>
          String(o.label).toLowerCase().includes(ql) ||
          (o.sublabel ?? "").toLowerCase().includes(ql),
      )
    : options;

  const count = selected.length;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between font-normal"
            >
              <span className="flex items-center gap-2 min-w-0">
                <DynamicIcon
                  name={icon as IconName}
                  className="size-4 shrink-0 text-muted-foreground"
                  fallback={() => <span className="size-4" />}
                />
                <span className="truncate text-muted-foreground">{label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 shrink-0">
                    {count}
                  </Badge>
                )}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}…`}
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>No matches.</CommandEmpty>
                <CommandGroup>
                  {shown.map((o) => {
                    const isSelected = selected.includes(o.key);
                    return (
                      <CommandItem
                        key={o.key}
                        value={String(o.key)}
                        onSelect={() => onToggle(o.key)}
                      >
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {o.lead}
                        <span className="flex-1 truncate">{o.label}</span>
                        {o.sublabel && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {o.sublabel}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {count > 0 && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label={`Clear ${label} filter`}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {count > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((key) => {
            const option = options.find((o) => o.key === key);
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
