import { useMemo } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Palette,
  Shapes,
  TagIcon,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
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
  const { bulkSetType, bulkDeleteStages } = useStageMutation(workflowId);

  const selectedStages = useMemo(() => {
    const ids = new Set(Array.from(selectedIds).map((id) => Number(id)));
    return stages.filter((s) => ids.has(s.ID));
  }, [stages, selectedIds]);

  const count = selectedStages.length;
  const types = new Set(selectedStages.map((s) => s.Type));
  const sharedType = types.size === 1 ? selectedStages[0]?.Type : null;
  const openCount = selectedStages.filter((s) => s.Type === "open").length;
  const busy = bulkSetType.isPending || bulkDeleteStages.isPending;
  const ids = selectedStages.map((s) => s.ID);

  const handleSetType = (type: Exclude<StageType, "open">) => {
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

  const handleDelete = () =>
    bulkDeleteStages.mutate(ids, {
      onSuccess: (result) => {
        const parts = [
          `Deleted ${result.success} stage${result.success !== 1 ? "s" : ""}.`,
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
      onError: () => toast.error("Failed to delete stages."),
    });

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={clearSelection}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${count} stage${count !== 1 ? "s" : ""}?`,
        description:
          openCount > 0
            ? `Open stages can't be deleted and will be skipped. This action cannot be undone.`
            : "This action cannot be undone.",
        busy: bulkDeleteStages.isPending,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="w-32">
            <Button variant="outline" className="w-full" disabled>
              <Shapes />
              Icon
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="w-32">
            <Button variant="outline" className="w-full" disabled>
              <Palette />
              Color
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="w-32">
            <Button variant="outline" className="w-full" disabled={busy}>
              <TagIcon />
              {sharedType ? (
                <StageTypeBadge type={sharedType} />
              ) : (
                <span className="text-muted-foreground">Mixed</span>
              )}
              <ChevronDown className="ml-1 opacity-60" />
            </Button>
          </span>
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
    </BulkActionsToolbarBase>
  );
}
