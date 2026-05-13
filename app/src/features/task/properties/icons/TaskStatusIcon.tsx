import type { Task } from "@/types/types";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleMinus,
} from "lucide-react";

export default function TaskStatusIcon({
  variant,
}: {
  variant: Task["Status"];
}) {
  let icon = <CircleDashed className="size-4 dark:stroke-neutral-500" />;
  switch (variant) {
    case "Open":
      break;
    case "Todo":
      icon = (
        <Circle className="size-4 stroke-orange-400 dark:stroke-orange-700" />
      );
      break;
    case "Doing":
      icon = (
        <CircleDot className="size-4 stroke-green-500 dark:stroke-green-600" />
      );
      break;
    case "Blocked":
      icon = (
        <CircleMinus className="size-4 stroke-red-700 dark:stroke-red-600" />
      );
      break;
    case "Done":
      icon = (
        <CircleCheck className="size-4 stroke-purple-600 dark:stroke-purple-500" />
      );
      break;
  }

  return icon;
}
