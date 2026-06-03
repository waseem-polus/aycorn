import { ChevronDown, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Stage, StageType } from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { STAGE_TYPE_COLORS } from "@/features/workflows/shared/stage-type-rules";
import {
  stageBadgeClass,
  stageCalendarBadgeClass,
} from "@/features/stage/stage-palette";

const ASSIGNABLE_TYPES: Exclude<StageType, "open">[] = [
  "todo",
  "doing",
  "done",
  "blocked",
];

const triggerClass = (type: StageType) =>
  cn(
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    stageCalendarBadgeClass(STAGE_TYPE_COLORS[type]),
  );

export function StageTypeSelect({
  stage,
  workflowId,
}: {
  stage: Stage;
  workflowId: number;
}) {
  const { bulkSetType } = useStageMutation(workflowId);

  const handleSetType = (type: Exclude<StageType, "open">) => {
    if (type === stage.Type) return;
    bulkSetType.mutate(
      { ids: [stage.ID], type },
      { onError: () => toast.error("Failed to update stage type.") },
    );
  };

  if (stage.Type === "open") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <button
              type="button"
              disabled
              className={cn(
                triggerClass("open"),
                "border-dashed cursor-not-allowed opacity-70 w-22 justify-between",
              )}
            >
              open
              <Lock className="size-3" />
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          The open stage type can&apos;t be changed.
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            triggerClass(stage.Type),
            "cursor-pointer hover:opacity-80 w-22 justify-between",
          )}
        >
          {stage.Type}
          <ChevronDown className="size-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-0">
        {ASSIGNABLE_TYPES.map((type) => (
          <DropdownMenuItem key={type} onClick={() => handleSetType(type)}>
            <span
              className={cn(
                "inline-flex w-full items-center rounded px-1.5 py-0.5 text-xs font-medium",
                stageBadgeClass(STAGE_TYPE_COLORS[type]),
              )}
            >
              {type}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
