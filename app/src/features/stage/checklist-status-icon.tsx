import type { ChecklistStatus } from "@/types/types";
import { CircleCheck, CircleDashed } from "lucide-react";
import { CircularProgress } from "@/features/checklists/circular-progress";

export default function ChecklistStatusIcon({
  variant,
  doneCount = 0,
  totalCount = 0,
}: {
  variant: ChecklistStatus;
  doneCount?: number;
  totalCount?: number;
}) {
  switch (variant) {
    case "unused":
      return (
        <CircleDashed className="size-4.5 stroke-2 text-muted-foreground" />
      );
    case "done":
      return (
        <CircleCheck className="size-4.5 stroke-2 stroke-purple-600 dark:stroke-purple-500" />
      );
    case "doing":
      return (
        <CircularProgress
          done={doneCount}
          total={totalCount}
          className="size-5 text-green-500 dark:text-green-600"
        />
      );
  }
}
