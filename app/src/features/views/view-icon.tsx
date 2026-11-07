import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import type { BoardView } from "@/features/views/view-types";
import { cn } from "@/lib/utils";

/** A view's icon in its own color, read-only. Mirrors ProjectIcon. */
export function ViewIcon({
  view,
  className,
}: {
  view: Pick<BoardView, "Icon" | "Color">;
  className?: string;
}) {
  return (
    <DynamicIcon
      name={(view.Icon || "rows-3") as IconName}
      className={cn("size-4 shrink-0", stageStrokeClass(view.Color || "gray"), className)}
      fallback={() => <span className="size-4 shrink-0" />}
    />
  );
}
