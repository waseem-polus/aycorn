import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { cn } from "@/lib/utils";

export function SubtaskProgressBar({
    done,
    total,
    className = "",
}: {
    done: number;
    total: number;
    className?: string;
}) {
  const pct = Math.round((done / total) * 100);

  return (
    <span className={cn("flex gap-2 items-center w-full", className)}>
      <span className="text-muted-foreground text-xs">
        {done}/{total}
      </span>
      <SegmentedProgress
        segments={[
          { count: done, className: "bg-primary", label: "Done subtasks" },
          {
            count: total - done,
            className: "bg-primary-foreground dark:bg-accent",
            label: "Open subtasks",
          },
        ]}
      />
      <span className="text-muted-foreground text-xs">{pct}%</span>
    </span>
  );
}
