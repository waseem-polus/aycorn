import { useMemo } from "react";
import { AlertTriangle, ChevronDown, Palette, Shapes, X } from "lucide-react";
import { toast } from "sonner";
import type { Stage, StageType } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSharedSelection } from "@/hooks/useSelection";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";

const ASSIGNABLE_TYPES: Exclude<StageType, "open">[] = [
  "todo",
  "doing",
  "done",
  "blocked",
];

export function StagesBulkActionsToolbar({
  stages,
  workflowId,
}: {
  stages: Stage[];
  workflowId: number;
}) {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { bulkSetType } = useStageMutation(workflowId);

  const selectedStages = useMemo(() => {
    const ids = new Set(Array.from(selectedIds).map((id) => Number(id)));
    return stages.filter((s) => ids.has(s.ID));
  }, [stages, selectedIds]);

  const count = selectedStages.length;
  if (count === 0) return null;

  const types = new Set(selectedStages.map((s) => s.Type));
  const sharedType = types.size === 1 ? selectedStages[0].Type : null;
  const openCount = selectedStages.filter((s) => s.Type === "open").length;
  const busy = bulkSetType.isPending;

  const handleSetType = (type: Exclude<StageType, "open">) => {
    const ids = selectedStages.map((s) => s.ID);

    bulkSetType.mutate(
      { ids, type },
      {
        onSuccess: (result) => {
          const parts = [
            `Set ${result.success} stage${result.success !== 1 ? "s" : ""} to ${type}.`,
          ];
          if (result.skipped > 0) {
            parts.push(
              `${result.skipped} open stage${result.skipped !== 1 ? "s" : ""} skipped.`,
            );
          }
          if (result.failed > 0) parts.push(`${result.failed} failed.`);
          toast(parts.join(" "));
          clearSelection();
        },
        onError: () => toast.error("Failed to update stage types."),
      },
    );
  };

  return (
    <div
      data-keep-selection=""
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-lg border bg-background px-3 py-1.5 shadow-lg"
    >
      <span className="text-sm font-medium px-2">{count} selected</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={clearSelection}
        aria-label="Clear selection"
      >
        <X />
      </Button>

      <Separator orientation="vertical" className="!h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button variant="ghost" size="sm" disabled>
              <Shapes />
              Icon
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button variant="ghost" size="sm" disabled>
              <Palette />
              Color
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="!h-6 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={busy}>
            {sharedType ? (
              <StageTypeBadge type={sharedType} />
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Mixed Type
              </span>
            )}
            <ChevronDown className="ml-1 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {openCount > 0 && (
            <>
              <DropdownMenuLabel className="flex items-start gap-2 text-xs font-normal text-muted-foreground max-w-[220px]">
                <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                <span>
                  {openCount} open stage{openCount !== 1 ? "s" : ""} will be
                  skipped — open stages can't change type.
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {ASSIGNABLE_TYPES.map((type) => (
            <DropdownMenuItem key={type} onClick={() => handleSetType(type)}>
              <StageTypeBadge type={type} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
