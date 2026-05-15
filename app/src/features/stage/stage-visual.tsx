import type { Stage } from "@/types/types";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { stageStrokeClass, stageTintClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

export { stageStrokeClass, stageTintClass };

export function StageIcon({
  stage,
  className,
}: {
  stage: Stage | undefined;
  className?: string;
}) {
  const stroke = stage ? stageStrokeClass(stage.Color) : stageStrokeClass("gray");
  return (
    <DynamicIcon
      name={(stage?.Icon || "circle-dashed") as IconName}
      className={cn("size-4", stroke, className)}
      fallback={() => <span className="size-4" />}
    />
  );
}
