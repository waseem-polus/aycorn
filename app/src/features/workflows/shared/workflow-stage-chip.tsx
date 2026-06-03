import type { Stage } from "@/types/types";
import { StageIcon, stageTintClass } from "@/features/stage/stage-visual";
import { cn } from "@/lib/utils";

export function WorkflowStageChip({
  stage,
  className = "",
}: {
  stage: Stage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs",
        stageTintClass(stage.Color),
        className,
      )}
    >
      <StageIcon stage={stage} className="size-3.5" />
      {stage.Name}
    </span>
  );
}
