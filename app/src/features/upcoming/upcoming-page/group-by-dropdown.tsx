import { CalendarDays, ChevronDown, Layers2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { GroupByKey } from "@/features/upcoming/hooks/useUpcomingFilters";
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

type Props = {
  groupBy: GroupByKey;
  onChange: (v: GroupByKey) => void;
};

export function GroupByDropdown({ groupBy, onChange }: Props) {
  const cur = GROUP_OPTIONS.find((o) => o.key === groupBy) ?? GROUP_OPTIONS[0];
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Layers2 className="text-muted-foreground" />
              {cur.label}
              <ChevronDown className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Group by</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-44">
        {GROUP_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(o.key === groupBy && "bg-accent")}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
