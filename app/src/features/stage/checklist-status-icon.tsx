import type { StageType } from "@/types/types";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleMinus,
} from "lucide-react";

export default function ChecklistStatusIcon({
  variant,
}: {
  variant: StageType;
}) {
  switch (variant) {
    case "open":
      return <CircleDashed className="size-4 dark:stroke-neutral-500" />;
    case "todo":
      return (
        <Circle className="size-4 stroke-orange-400 dark:stroke-orange-700" />
      );
    case "doing":
      return (
        <CircleDot className="size-4 stroke-green-500 dark:stroke-green-600" />
      );
    case "blocked":
      return (
        <CircleMinus className="size-4 stroke-red-700 dark:stroke-red-600" />
      );
    case "done":
      return (
        <CircleCheck className="size-4 stroke-purple-600 dark:stroke-purple-500" />
      );
  }
}
