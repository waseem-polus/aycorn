import type { StageType } from "@/types/types";
import { cn } from "@/lib/utils";
import { STAGE_TYPE_COLORS } from "@/features/workflows/shared/stage-type-rules";

const tintByColor: Record<string, string> = {
  gray: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  orange:
    "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  green:
    "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200",
  purple:
    "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-200",
  red: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200",
  yellow:
    "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200",
};

export function StageTypeBadge({ type }: { type: StageType }) {
  const color = STAGE_TYPE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs",
        tintByColor[color] ?? tintByColor.gray,
      )}
    >
      {type}
    </span>
  );
}
