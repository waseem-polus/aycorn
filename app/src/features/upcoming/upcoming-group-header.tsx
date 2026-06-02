import { ChevronRight } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import type { TaskGroup } from "@/features/upcoming/upcoming-grouping";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import type { Priority } from "@/types/types";
import { stageStrokeClass } from "@/features/stage/stage-palette";

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
        "flex items-center gap-2 px-3 py-2 cursor-pointer select-none sticky top-0 z-10 border-b border-border",
        isDanger
          ? "bg-destructive/5 hover:bg-destructive/10"
          : "bg-muted hover:bg-muted",
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
      <span
        className={cn(
          "text-sm font-medium",
          isDanger
            ? "text-destructive"
            : isMuted
              ? "text-muted-foreground"
              : "text-foreground",
        )}
      >
        {group.label}
      </span>
      {group.sublabel && (
        <span className="text-xs text-muted-foreground">{group.sublabel}</span>
      )}
      <span className="flex-1" />
      <span className="shrink-0 hidden sm:flex w-1/8 text-xs text-muted-foreground">
        Stage
      </span>
      <span className="shrink-0 hidden md:flex w-1/8 text-xs text-muted-foreground">
        Type
      </span>
      <span
        className={cn(
          "text-xs font-medium rounded-full px-1.5 py-0.5 min-w-5 text-right w-3/10 md:w-1/5",
          isDanger
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
        )}
      >
        {group.tasks.length}
      </span>
    </div>
  );
}
