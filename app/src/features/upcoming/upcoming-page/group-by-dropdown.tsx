import { ChevronDown, Layers2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DATE_GROUP_KEYS,
  GRANULARITIES,
  GROUP_LABELS,
} from "@/features/views/view-groupings";
import type { Granularity, GroupByKey } from "@/features/views/view-types";
import { cn } from "@/lib/utils";

type Props = {
  groupBy: GroupByKey | null;
  granularity: Granularity;
  /** The groupings this view offers (from the view registry). */
  options: GroupByKey[];
  /** Whether "No grouping" is offered. */
  optional: boolean;
  onChange: (groupBy: GroupByKey | null) => void;
  onGranularityChange: (granularity: Granularity) => void;
};

/** The list view's quick grouping control; it edits the shown view's grouping. */
export function GroupByDropdown({
  groupBy,
  granularity,
  options,
  optional,
  onChange,
  onGranularityChange,
}: Props) {
  const label = groupBy ? GROUP_LABELS[groupBy] : "None";
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-1.5">
              <Layers2 className="text-muted dark:text-foreground" />
              <span className="text-muted text-xs dark:text-foreground">Group by</span>{" "}
              {label}
              <ChevronDown className="text-muted dark:text-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {groupBy ? `Group by ${label.toLowerCase()}` : "Not grouped"}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-44">
        {optional && (
          <>
            <DropdownMenuItem
              onClick={() => onChange(null)}
              className={cn(groupBy === null && "bg-accent")}
            >
              No grouping
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((key) =>
          DATE_GROUP_KEYS.includes(key) ? (
            <DropdownMenuSub key={key}>
              <DropdownMenuSubTrigger
                className={cn(key === groupBy && "bg-accent")}
                onClick={() => onChange(key)}
              >
                {GROUP_LABELS[key]}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {GRANULARITIES.map((g) => (
                  <DropdownMenuItem
                    key={g.value}
                    onClick={() => {
                      onChange(key);
                      onGranularityChange(g.value);
                    }}
                    className={cn(key === groupBy && g.value === granularity && "bg-accent")}
                  >
                    {g.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className={cn(key === groupBy && "bg-accent")}
            >
              {GROUP_LABELS[key]}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
