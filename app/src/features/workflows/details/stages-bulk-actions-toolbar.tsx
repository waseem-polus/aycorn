import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Palette,
  Shapes,
  TagIcon,
  Trash2,
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
import { DeleteStagesDialog } from "@/features/workflows/details/delete-stages-dialog";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";

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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const selectedStages = useMemo(() => {
    const ids = new Set(Array.from(selectedIds).map((id) => Number(id)));
    return stages.filter((s) => ids.has(s.ID));
  }, [stages, selectedIds]);

  const count = selectedStages.length;
  const types = new Set(selectedStages.map((s) => s.Type));
  const sharedType = types.size === 1 ? selectedStages[0]?.Type : null;
  const openCount = selectedStages.filter((s) => s.Type === "open").length;
  const stagesWithTasks = selectedStages.filter((s) => s.TaskCount > 0);
  const hasTaskStages = stagesWithTasks.length > 0;
  const busy = bulkSetType.isPending || bulkDeleteStages.isPending;
  const ids = selectedStages.map((s) => s.ID);

  const handleSetType = (type: Exclude<StageType, "open">) => {
    bulkSetType.mutate(
      { ids, type },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Set ${result.success} stage${result.success !== 1 ? "s" : ""} to ${type}.`,
          );
          clearSelection();
        },
        onError: () => toast.error("Failed to update stage types."),
      },
    );
  };

  const handleSimpleDelete = () =>
    bulkDeleteStages.mutate(
      { ids },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Deleted ${result.success} stage${result.success !== 1 ? "s" : ""}.`,
          );
          clearSelection();
        },
        onError: () => toast.error("Failed to delete stages."),
      },
    );

  const deleteDescription = (() => {
    const parts: string[] = [];
    if (openCount > 0)
      parts.push("Open stages can't be deleted and will be skipped.");
    return parts.length > 0
      ? parts.join(" ") + " This action cannot be undone."
      : "This action cannot be undone.";
  })();

  return (
    <>
      <BulkActionsToolbarBase
        count={count}
        onClear={clearSelection}
        delete={
          hasTaskStages
            ? undefined
            : {
                onConfirm: handleSimpleDelete,
                title: `Delete ${count} stage${count !== 1 ? "s" : ""}?`,
                description: deleteDescription,
                busy: bulkDeleteStages.isPending,
              }
        }
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
                <DropdownMenuLabel className="flex items-start gap-2 text-xs font-normal text-muted-foreground max-w-60">
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    {openCount} open stage{openCount !== 1 ? "s" : ""}{" "}
                    can&apos;t change type. These will be skipped.
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

        {hasTaskStages && (
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </Button>
        )}
      </BulkActionsToolbarBase>

      <DeleteStagesDialog
        stages={stages}
        stagesToDelete={selectedStages}
        workflowId={workflowId}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onSuccess={clearSelection}
      />
    </>
  );
}
