import { ChevronRight } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import type { TaskGroup } from "@/features/upcoming/upcoming-grouping";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import type { Priority } from "@/types/types";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  group: TaskGroup;
  collapsed: boolean;
  onToggle: () => void;
};

export function UpcomingGroupHeader({ group, collapsed, onToggle }: Props) {
  const isDanger = group.tone === "danger";
  const isMuted = group.tone === "muted";

  const marker = group.priority ? (
    <TaskPriorityIcon variant={group.priority as Priority} />
  ) : (
    <DynamicIcon
      name={(group.icon ?? "circle-dashed") as IconName}
      className={cn(
        "size-4",
        isDanger
          ? "stroke-destructive"
          : group.color
            ? stageStrokeClass(group.color)
            : "stroke-muted-foreground",
      )}
      fallback={() => <span className="size-4" />}
    />
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer select-none sticky top-0 z-10 border-b border-border bg-muted hover:bg-muted",
      )}
      onClick={onToggle}
    >
      <ChevronRight
        className={cn(
          "size-3.5 text-muted-foreground transition-transform duration-150",
          !collapsed && "rotate-90",
        )}
      />
      <span
        className={cn(isDanger ? "text-destructive" : "text-muted-foreground")}
      >
        {marker}
      </span>
      <span className="flex items-baseline gap-2 min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "truncate text-sm font-medium",
                isDanger
                  ? "text-destructive"
                  : isMuted
                    ? "text-muted-foreground"
                    : "text-foreground",
              )}
            >
              {group.label}
            </span>
          </TooltipTrigger>
          <TooltipContent>{group.label}</TooltipContent>
        </Tooltip>
        {group.sublabel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 max-w-[40%] truncate text-xs text-muted-foreground">
                {group.sublabel}
              </span>
            </TooltipTrigger>
            <TooltipContent>{group.sublabel}</TooltipContent>
          </Tooltip>
        )}
      </span>
      <span className="shrink-0 hidden sm:flex w-1/8 text-xs text-muted-foreground">
        Stage
      </span>
      <span className="shrink-0 hidden md:flex w-1/8 text-xs text-muted-foreground">
        Type
      </span>
      <span
        className={cn(
          "text-xs font-medium rounded-full px-1.5 py-0.5 min-w-5 text-right w-1/5 lg:w-3/10",
        )}
      >
        {group.tasks.length}
      </span>
    </div>
  );
}
