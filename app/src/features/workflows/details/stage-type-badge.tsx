import type { StageType } from "@/types/types";
import { cn } from "@/lib/utils";
import { STAGE_TYPE_COLORS } from "@/features/workflows/shared/stage-type-rules";
import { stageBadgeClass } from "@/features/stage/stage-palette";

export function StageTypeBadge({
  type,
  className = "",
}: {
  type: StageType;
  className?: string;
}) {
  const color = STAGE_TYPE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs",
        className,
        stageBadgeClass(color),
      )}
    >
      {type}
    </span>
  );
}
