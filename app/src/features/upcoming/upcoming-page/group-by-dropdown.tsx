import { ChevronDown, Layers2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
  GroupByKey,
  Granularity,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GROUP_OPTIONS: { key: GroupByKey; label: string }[] = [
  { key: "timePlanned", label: "Time planned" },
  { key: "timeCompleted", label: "Time completed" },
  { key: "project", label: "Project" },
  { key: "stage", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "type", label: "Type" },
  { key: "assignee", label: "Assignee" },
  { key: "checklist", label: "Checklist" },
];

const DATE_GROUP_KEYS: GroupByKey[] = ["timePlanned", "timeCompleted"];

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

type Props = {
  groupBy: GroupByKey;
  granularity: Granularity;
  onChange: (v: GroupByKey) => void;
  onGranularityChange: (v: Granularity) => void;
};

export function GroupByDropdown({
  groupBy,
  granularity,
  onChange,
  onGranularityChange,
}: Props) {
  const cur = GROUP_OPTIONS.find((o) => o.key === groupBy) ?? GROUP_OPTIONS[0];
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-1.5">
              <Layers2 className="text-muted" />
              <span className="text-muted text-xs">Group by</span> {cur.label}
              <ChevronDown className="text-muted" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Group by</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-44">
        {GROUP_OPTIONS.map((o) =>
          DATE_GROUP_KEYS.includes(o.key) ? (
            <DropdownMenuSub key={o.key}>
              <DropdownMenuSubTrigger
                className={cn(o.key === groupBy && "bg-accent")}
                onClick={() => onChange(o.key)}
              >
                {o.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {GRANULARITIES.map((g) => (
                  <DropdownMenuItem
                    key={g.value}
                    onClick={() => {
                      onChange(o.key);
                      onGranularityChange(g.value);
                    }}
                    className={cn(
                      o.key === groupBy &&
                        g.value === granularity &&
                        "bg-accent",
                    )}
                  >
                    {g.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={o.key}
              onClick={() => onChange(o.key)}
              className={cn(o.key === groupBy && "bg-accent")}
            >
              {o.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
