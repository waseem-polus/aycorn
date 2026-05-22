import type { Task } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import TaskTypeIcon from "./icons/TaskTypeIcon";
import { cn } from "@/lib/utils";

export default function TaskTypeBadge({
  variant,
  className = "",
}: {
  variant: Task["Type"];
  className?: string;
}) {
  let color = "bg-green-100 dark:bg-green-900/40";
  switch (variant) {
    case "Dev":
      break;
    case "Test":
      color = "bg-blue-100 dark:bg-blue-900/30";
      break;
    case "Reminder":
      color = "bg-orange-100 dark:bg-orange-900/30";
      break;
  }

  return (
    <Badge variant="secondary" className={cn(className, color)}>
      <TaskTypeIcon variant={variant} />
      {variant}
    </Badge>
  );
}
