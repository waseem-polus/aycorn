import type { TaskType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "lucide-react/dynamic";
import { stageBadgeClass, stageStrokeClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

export default function TaskTypeBadge({
  type,
  className = "",
}: {
  type: TaskType;
  className?: string;
}) {
  if (!type?.ID) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(className, stageBadgeClass(type.Color))}
    >
      <DynamicIcon
        name={type.Icon as any}
        className={`size-3.5 ${stageStrokeClass(type.Color)}`}
      />
      {type.Name}
    </Badge>
  );
}
