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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { useSharedSelection } from "@/hooks/useSelection";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { DeleteStagesDialog } from "@/features/workflows/details/delete-stages-dialog";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorGrid } from "@/features/color-picker/color-grid";

const ASSIGNABLE_TYPES: Exclude<StageType, "open">[] = ["todo", "doing", "done"];

export function StagesBulkActionsToolbar({
  stages,
  workflowId,
}: {
  stages: Stage[];
  workflowId: number;
}) {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { bulkSetType, bulkSetColor, bulkSetIcon, bulkDeleteStages } =
    useStageMutation(workflowId);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

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
  const busy =
    bulkSetType.isPending ||
    bulkSetColor.isPending ||
    bulkSetIcon.isPending ||
    bulkDeleteStages.isPending;
  const ids = selectedStages.map((s) => s.ID);

  const stageNoun = (n: number) => `${n} stage${n !== 1 ? "s" : ""}`;

  const handleSetColor = (color: string) =>
    bulkSetColor.mutate(
      { ids, color },
      {
        onSuccess: (result) => {
          bulkResultToast(result, `Updated ${stageNoun(result.success)}.`);
          clearSelection();
        },
        onError: () => toast.error("Failed to update stage colors."),
      },
    );

  const handleSetIcon = (icon: string) =>
    bulkSetIcon.mutate(
      { ids, icon },
      {
        onSuccess: (result) => {
          bulkResultToast(result, `Updated ${stageNoun(result.success)}.`);
          clearSelection();
        },
        onError: () => toast.error("Failed to update stage icons."),
      },
    );

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
        <IconPickerPopover
          value=""
          onSelect={handleSetIcon}
          align="center"
          trigger={
            <Button variant="outline" disabled={busy}>
              <Shapes />
              Icon
            </Button>
          }
        />

        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={busy}>
              <Palette />
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center">
            <ColorGrid
              value=""
              onSelect={(color) => {
                setColorOpen(false);
                handleSetColor(color);
              }}
            />
          </PopoverContent>
        </Popover>

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
