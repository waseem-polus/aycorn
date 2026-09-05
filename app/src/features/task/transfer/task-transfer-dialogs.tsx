import { DuplicateTasksDialog } from "@/features/task/transfer/duplicate-tasks-dialog";
import { TransferTasksDialog } from "@/features/task/transfer/transfer-tasks-dialog";
import type { TaskTransfer } from "@/features/task/transfer/use-task-transfer";

/**
 * Render this as a *sibling* of whatever triggers it, never inside a clickable
 * card or menu — Radix portals its content but React events still bubble
 * through the component tree.
 */
export function TaskTransferDialogs({ transfer }: { transfer: TaskTransfer }) {
  return (
    <>
      {transfer.transferMode !== null && (
        <TransferTasksDialog
          open
          onOpenChange={(open) => !open && transfer.setTransferMode(null)}
          mode={transfer.transferMode}
          tasks={transfer.tasks}
          excludeProjectId={transfer.excludeProjectId}
          onSuccess={
            transfer.transferMode === "move"
              ? transfer.onMoved
              : transfer.onCopied
          }
        />
      )}
      <DuplicateTasksDialog
        open={transfer.duplicateOpen}
        onOpenChange={transfer.setDuplicateOpen}
        taskIds={transfer.tasks.map((t) => t.ID)}
        onSuccess={transfer.onCopied}
      />
    </>
  );
}
