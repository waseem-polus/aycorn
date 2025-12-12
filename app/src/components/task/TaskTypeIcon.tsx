import type { Task } from "@/types/types";
import { Bell, Bot, Bug } from "lucide-react";

export default function TaskTypeIcon({ variant }: { variant: Task["Type"] }) {
  let icon = <Bot className="size-4 stroke-green-500" />;
  switch (variant) {
    case "Dev":
      break;
    case "Test":
      icon = <Bug className="size-4 stroke-blue-500" />;
      break;
    case "Reminder":
      icon = <Bell className="size-4 stroke-orange-400" />;
      break;
  }

  return icon;
}
