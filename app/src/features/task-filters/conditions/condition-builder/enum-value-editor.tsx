import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { allSourceOptions, type OptionSource } from "@/features/task-filters/option-groups";

type Props = {
  source: OptionSource;
  /** Noun for the search placeholder, e.g. "priorities". */
  plural: string;
  selected: (string | number)[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (ids: (string | number)[]) => void;
};

/**
 * Chips-in-the-field multi-select over the same option list the basic
 * filters use. The whole field opens the list; the chevron is the focusable
 * trigger and each chip has its own remove button.
 */
export function EnumValueEditor({
  source,
  plural,
  selected,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const options = allSourceOptions(source);

  const toggle = (key: string | number) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          className="flex min-h-9 w-full cursor-pointer items-center gap-1 rounded-md border bg-background py-1 pr-1 pl-2 shadow-xs"
          onClick={() => onOpenChange(true)}
        >
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selected.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Choose {plural}…
              </span>
            )}
            {selected.map((key) => {
              const option = options.find((o) => o.key === key);
              // A saved filter can carry values from another board (a stage or
              // checklist of a different project) or ones since deleted. They
              // still apply — and match nothing here — so say so instead of
              // hiding them.
              const label = option?.label ?? "Not on this board";
              return (
                <Badge
                  key={key}
                  variant={option ? "secondary" : "outline"}
                  className={cn(
                    "gap-1 py-0.5 pr-1 pl-1.5",
                    !option && "border-dashed font-normal text-muted-foreground",
                  )}
                >
                  {option?.lead}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="max-w-32 truncate">{label}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {option ? label : "This value doesn't exist on this board, so it matches nothing here."}
                    </TooltipContent>
                  </Tooltip>
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(key);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={`Choose ${plural}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        data-vaul-no-drag
      >
        <OptionCommandList
          {...source}
          selected={selected}
          onSelect={toggle}
          searchPlaceholder={`Search ${plural}…`}
          footer={
            <div className="flex items-center justify-between border-t px-3 py-1.5 text-sm">
              <span className="text-muted-foreground">{selected.length} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                disabled={selected.length === 0}
                onClick={() => onChange([])}
              >
                Clear
              </Button>
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  );
}
