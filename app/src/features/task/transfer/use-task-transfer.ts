import { useState } from "react";
import { toast } from "sonner";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { useTaskTransferMutation } from "@/features/task/transfer/queries/useTaskTransferMutation";
import type { TransferTask } from "@/features/task/transfer/transfer-tasks-dialog";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { pluralize } from "@/utils/pluralize";

type Options = {
  tasks: TransferTask[];
  // The selection's own project, hidden from the destination picker. Omit for
  // a selection that spans projects.
  excludeProjectId?: number | null;
  // A move takes the task out of the surface that opened it, so the drawer
  // showing it has to close. Copying and duplicating leave the original in
  // place, hence the separate callback.
  onMoved?: () => void;
  onCopied?: () => void;
};

/**
 * The three task-transfer actions, shared by the single-task menu and both bulk
 * toolbars. Owns the dialog state; render the dialogs with
 * `<TaskTransferDialogs transfer={...} />`.
 */
export function useTaskTransfer({
  tasks,
  excludeProjectId,
  onMoved,
  onCopied,
}: Options) {
  const [transferMode, setTransferMode] = useState<"move" | "copy" | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const { copyTasks } = useTaskTransferMutation();

  // Only a single task can be checked cheaply for links; a whole selection
  // would need a count endpoint, so bulk duplicate always asks.
  const singleTaskId = tasks.length === 1 ? tasks[0].ID : 0;
  const { data: relationships } = useTaskRelationshipsQuery(singleTaskId);

  const duplicate = () => {
    // Nothing to decide when there are no links: duplicate straight away
    // rather than opening a dialog with a single moot checkbox in it.
    if (singleTaskId !== 0 && relationships?.length === 0) {
      copyTasks.mutate(
        { ids: [singleTaskId], copyRelationships: false },
        {
          onSuccess: (result) => {
            bulkResultToast(
              result,
              `Duplicated ${pluralize(result.success, "task")}.`,
            );
            onCopied?.();
          },
          onError: (err) =>
            toast.error(err.message || "Failed to duplicate task."),
        },
      );
      return;
    }
    setDuplicateOpen(true);
  };

  return {
    tasks,
    excludeProjectId,
    onMoved,
    onCopied,
    transferMode,
    duplicateOpen,
    setTransferMode,
    setDuplicateOpen,
    openMove: () => setTransferMode("move"),
    openCopy: () => setTransferMode("copy"),
    duplicate,
    busy: copyTasks.isPending,
  };
}

export type TaskTransfer = ReturnType<typeof useTaskTransfer>;
