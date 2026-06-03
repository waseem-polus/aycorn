import { cn } from "@/lib/utils";
import type { Task } from "@/types/types";
import {
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  Equal,
  type LucideIcon,
} from "lucide-react";
import { priorityStrokeClass } from "@/features/task/properties/task-priority-palette";

const PRIORITY_ICON: Record<Task["Priority"], LucideIcon> = {
  Low: ChevronDown,
  Medium: Equal,
  High: ChevronUp,
  Urgent: ChevronsUp,
};

export default function TaskPriorityIcon({
  variant,
  className = "",
}: {
  variant: Task["Priority"];
  className?: string;
}) {
  const Icon = PRIORITY_ICON[variant];
  return (
    <Icon className={cn("size-4", priorityStrokeClass(variant), className)} />
  );
}
