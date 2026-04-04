import type { Task } from "@/types/types";
import { ChevronDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";

export default function TaskPriorityIcon({
  variant,
}: {
  variant: Task["Priority"];
}) {
  let icon = <ChevronDown className="size-4 stroke-blue-400" />;
  switch (variant) {
    case "Low":
      break;
    case "Medium":
      icon = <Equal className="size-4 stroke-yellow-400" />;
      break;
    case "High":
      icon = <ChevronUp className="size-4 stroke-orange-500" />;
      break;
    case "Urgent":
      icon = <ChevronsUp className="size-4 stroke-red-700" />;
      break;
  }

  return icon;
}
