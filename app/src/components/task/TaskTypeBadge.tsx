import type { Task } from "@/types/types";
import { Badge } from "../ui/badge";
import TaskTypeIcon from "./TaskTypeIcon";

export default function TaskTypeBadge({ variant }: { variant: Task["Type"] }) {
  let color = "bg-green-100";
  switch (variant) {
    case "Dev":
      break;
    case "Test":
      color = "bg-blue-100";
      break;
    case "Reminder":
      color = "bg-orange-100";
      break;
  }

  return (
    <Badge variant="secondary" className={color}>
      <TaskTypeIcon variant={variant} />
      {variant}
    </Badge>
  );
}
