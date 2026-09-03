import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/types";

export const PROJECT_FALLBACK_ICON = "folder";

/**
 * A project's icon in its own color, read-only. Mirrors StageIcon — the
 * editable version is IconColorPicker.
 */
export function ProjectIcon({
  project,
  className,
}: {
  project: Pick<Project, "Icon" | "Color"> | undefined;
  className?: string;
}) {
  return (
    <DynamicIcon
      name={(project?.Icon || PROJECT_FALLBACK_ICON) as IconName}
      className={cn(
        "size-4 shrink-0",
        stageStrokeClass(project?.Color ?? "gray"),
        className,
      )}
      fallback={() => <span className="size-4 shrink-0" />}
    />
  );
}
