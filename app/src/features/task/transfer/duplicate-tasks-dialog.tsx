import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { useTaskTransferMutation } from "@/features/task/transfer/queries/useTaskTransferMutation";
import { pluralize } from "@/utils/pluralize";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskIds: number[];
  onSuccess?: () => void;
};

/**
 * Duplicating in place needs no mapping — the copy keeps its checklist and
 * stage — so the only decision left is what to do with the task's links.
 * Callers skip this dialog entirely when they know there are none.
 */
export function DuplicateTasksDialog({
  open,
  onOpenChange,
  taskIds,
  onSuccess,
}: Props) {
  const [copyRelationships, setCopyRelationships] = useState(false);
  const { copyTasks } = useTaskTransferMutation();

  const count = taskIds.length;

  const handleOpenChange = (next: boolean) => {
    if (!next) setCopyRelationships(false);
    onOpenChange(next);
  };

  const handleConfirm = () => {
    copyTasks.mutate(
      { ids: taskIds, copyRelationships },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Duplicated ${pluralize(result.success, "task")}.`,
          );
          handleOpenChange(false);
          onSuccess?.();
        },
        onError: (err) =>
          toast.error(err.message || "Failed to duplicate tasks."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate {pluralize(count, "task")}?</DialogTitle>
          <DialogDescription>
            The {count === 1 ? "copy stays" : "copies stay"} in the same
            checklist and stage, named "… (copy)".
          </DialogDescription>
        </DialogHeader>

        <Label className="flex items-center gap-2 font-normal">
          <Checkbox
            checked={copyRelationships}
            onCheckedChange={(checked) => setCopyRelationships(checked === true)}
          />
          Also copy task links
        </Label>

        <DialogFooter className="flex flex-row justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={copyTasks.isPending} onClick={handleConfirm}>
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
