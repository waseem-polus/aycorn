import React, { useState } from "react";
import { CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { StageIcon } from "@/features/stage/stage-visual";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import type { Stage } from "@/types/types";
import { toast } from "sonner";

type DeleteStagesDialogProps = {
  stages: Stage[];
  stagesToDelete: Stage[];
  workflowId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const stageName = (stage: Stage) =>
  stage.Name !== "" ? stage.Name : "Untitled stage";

export function DeleteStagesDialog({
  stages,
  stagesToDelete,
  workflowId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteStagesDialogProps) {
  const { bulkDeleteStages } = useStageMutation(workflowId);

  const deletable = stagesToDelete.filter((s) => s.Type !== "open");
  const withTasks = deletable.filter((s) => s.TaskCount > 0);
  const withoutTasks = deletable.filter((s) => s.TaskCount === 0);
  const orderedStages = [...withTasks, ...withoutTasks];

  const deletingIds = new Set(deletable.map((s) => s.ID));
  const survivingStages = stages.filter((s) => !deletingIds.has(s.ID));
  const totalTaskCount = withTasks.reduce((sum, s) => sum + s.TaskCount, 0);

  const [mappings, setMappings] = useState<Record<number, number>>({});
  const allMapped = withTasks.every((s) => mappings[s.ID] !== undefined);

  const count = deletable.length;

  const handleOpenChange = (next: boolean) => {
    if (!next) setMappings({});
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const ids = stagesToDelete.map((s) => s.ID);
    bulkDeleteStages.mutate(
      { ids, taskMappings: mappings },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Deleted ${result.success} stage${result.success !== 1 ? "s" : ""}.`,
          );
          handleOpenChange(false);
          onSuccess?.();
        },
        onError: (err) =>
          toast.error(err.message || "Failed to delete stages."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Delete {count} stage{count !== 1 ? "s" : ""}?
          </DialogTitle>
          <DialogDescription>
            {withTasks.length > 0 ? (
              <>
                <span className="font-bold">
                  {withTasks.length} stage{withTasks.length !== 1 ? "s" : ""}
                </span>{" "}
                hold tasks that must be moved to a destination before deletion.
                This action cannot be undone.
              </>
            ) : (
              "This action cannot be undone."
            )}
          </DialogDescription>
        </DialogHeader>

        {withTasks.length > 0 ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Stages being deleted
            </p>
            <span />
            <p className="text-xs font-medium text-muted-foreground">
              Move tasks to
            </p>

            {orderedStages.map((stage) => {
              if (stage.TaskCount === 0) {
                return (
                  <div
                    key={stage.ID}
                    className="col-span-3 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <StageIcon stage={stage} className="shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {stageName(stage)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        No tasks
                      </span>
                    </span>
                    <StageTypeBadge type={stage.Type} />
                  </div>
                );
              }

              return (
                <React.Fragment key={stage.ID}>
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <span className="flex items-center gap-2">
                      <StageIcon stage={stage} className="shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {stageName(stage)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stage.TaskCount} task{stage.TaskCount !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <StageTypeBadge type={stage.Type} />
                  </div>

                  <span className="text-muted-foreground text-xs text-center">
                    →
                  </span>

                  <Select
                    value={mappings[stage.ID]?.toString() ?? ""}
                    onValueChange={(val) =>
                      setMappings((prev) => ({
                        ...prev,
                        [stage.ID]: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {survivingStages.map((dest) => (
                        <SelectItem key={dest.ID} value={dest.ID.toString()}>
                          <span className="flex items-center gap-2">
                            <StageIcon stage={dest} className="shrink-0" />
                            <span className="truncate">{stageName(dest)}</span>
                            <StageTypeBadge type={dest.Type} />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orderedStages.map((stage) => (
              <div
                key={stage.ID}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2">
                  <StageIcon stage={stage} className="shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {stageName(stage)}
                  </span>
                </span>
                <StageTypeBadge type={stage.Type} />
              </div>
            ))}
          </div>
        )}

        {withTasks.length > 0 && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <CircleAlert className="size-3.5 mt-0.5 shrink-0" />
            <span>
              You can map several deleted stages to the same destination. Type
              compatibility is not enforced.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!allMapped || bulkDeleteStages.isPending}
            onClick={handleConfirm}
          >
            {totalTaskCount > 0
              ? `Delete & move ${totalTaskCount} task${totalTaskCount !== 1 ? "s" : ""}`
              : `Delete ${count} stage${count !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
