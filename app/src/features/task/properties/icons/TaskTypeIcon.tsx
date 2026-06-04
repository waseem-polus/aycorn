import type { TaskType } from "@/types/types";
import { DynamicIcon } from "lucide-react/dynamic";
import { stageStrokeClass } from "@/features/stage/stage-palette";

export default function TaskTypeIcon({ type }: { type: TaskType }) {
  return (
    <DynamicIcon
      name={type.Icon as any}
      className={`size-4 ${stageStrokeClass(type.Color)}`}
    />
  );
}
