import { cn } from "@/lib/utils";
import type { MatchMode } from "@/features/task-filters/conditions/condition-types";

const LABELS: Record<MatchMode, string> = { all: "AND", any: "OR", none: "NOR" };

/** The AND / OR / NOR pill between siblings, so the group's logic reads inline. */
export function LogicDivider({ match }: { match: MatchMode }) {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span
        className={cn(
          "rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
          match === "any" && "border-primary/30 bg-primary/10 text-primary",
          match === "all" && "border-border bg-background text-muted-foreground",
          match === "none" && "border-destructive/30 bg-destructive/10 text-destructive",
        )}
      >
        {LABELS[match]}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
