import { cn } from "@/lib/utils";
import type { Task } from "@/types/types";
import { ChevronDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";

export default function TaskPriorityIcon({
  variant,
  className = "",
}: {
  variant: Task["Priority"];
  className?: string;
}) {
  let icon = (
    <ChevronDown className={cn("size-4 stroke-blue-400", className)} />
  );
  switch (variant) {
    case "Low":
      break;
    case "Medium":
      icon = <Equal className={cn("size-4 stroke-yellow-400", className)} />;
      break;
    case "High":
      icon = (
        <ChevronUp className={cn("size-4 stroke-orange-500", className)} />
      );
      break;
    case "Urgent":
      icon = <ChevronsUp className={cn("size-4 stroke-red-700", className)} />;
      break;
  }

  return icon;
}
