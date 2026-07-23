import { Badge } from "@/components/ui/badge";
import { useUnresolvedBlockerCount } from "@/features/task/relationships/queries/useUnresolvedBlockerCount";
import { OctagonMinusIcon } from "lucide-react";
import { priorityOutlineBadgeClass } from "../properties/task-priority-palette";

export function UnresolvedBlockersBadge({ taskId }: { taskId: number }) {
  const count = useUnresolvedBlockerCount(taskId);
  if (count === 0) return null;

  return (
    <Badge variant="outline" className={priorityOutlineBadgeClass("Urgent")}>
      <OctagonMinusIcon />
      <span className="font-semibold">{count}</span>
      <span className="font-light truncate"> unresolved blocker{count > 1 ? "s" : ""}</span>
    </Badge>
  );
}
