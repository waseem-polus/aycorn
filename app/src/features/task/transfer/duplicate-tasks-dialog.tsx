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
  const { copyTasks } = useTaskTransferMutation();

  const count = taskIds.length;

  const handleDuplicate = (copyRelationships: boolean) => {
    copyTasks.mutate(
      { ids: taskIds, copyRelationships },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Duplicated ${pluralize(result.success, "task")}.`,
          );
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err) =>
          toast.error(err.message || "Failed to duplicate tasks."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate Task With Links</DialogTitle>
          <DialogDescription>
            Duplicate {pluralize(count, "task")} and{" "}
            {count > 1 ? "their" : "its"} links in this project?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row sm:justify-between w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <span className="flex gap-2">
            <Button
              variant="secondary"
              disabled={copyTasks.isPending}
              onClick={() => handleDuplicate(false)}
            >
              Duplicate Without Links
            </Button>
            <Button
              disabled={copyTasks.isPending}
              onClick={() => handleDuplicate(true)}
            >
              Duplicate
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
