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
  let icon = <CircleDashed className="size-4" />;
  switch (variant) {
    case "Open":
      break;
    case "Todo":
      icon = <Circle className="size-4 stroke-orange-400" />;
      break;
    case "Doing":
      icon = <CircleDot className="size-4 stroke-green-500" />;
      break;
    case "Blocked":
      icon = <CircleMinus className="size-4 stroke-red-700" />;
      break;
    case "Done":
      icon = <CircleCheck className="size-4 stroke-purple-600" />;
      break;
  }

  return icon;
}
