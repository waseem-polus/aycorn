import { stageSwatchClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

export function stageFillClass(color: string) {
  return stageSwatchClass(color);
}

export function StageColorSquare({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-label={`${color} color`}
      className={cn("inline-block size-4 rounded-sm", stageFillClass(color), className)}
    />
  );
}
