import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import type { TaskTypeGlobal } from "@/types/types";
import { toast } from "sonner";

type Props = {
  type: TaskTypeGlobal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTypeDialog({ type, open, onOpenChange }: Props) {
  const [transferId, setTransferId] = useState<string>("");
  const { data: allTypes = [] } = useTaskTypesQuery();
  const { deleteTaskType } = useTaskTypeMutation();

  const candidates = allTypes.filter((t) => t.ID !== type.ID);
  const hasTasksToTransfer = type.TaskCount > 0;
  const canConfirm = !hasTasksToTransfer || transferId !== "";

  const displayName = type.Name !== "" ? type.Name : "Untitled Type";

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId("");
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasTasksToTransfer
              ? `${type.TaskCount} ${type.TaskCount === 1 ? "task uses" : "tasks use"} this type. Choose a replacement type before deleting.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasTasksToTransfer && (
          <Select value={transferId} onValueChange={setTransferId}>
            <SelectTrigger>
              <SelectValue placeholder="Move tasks to..." />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((t) => (
                <SelectItem key={t.ID} value={String(t.ID)}>
                  {t.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canConfirm || deleteTaskType.isPending}
            onClick={() =>
              deleteTaskType.mutate(
                { id: type.ID, transferTypeId: Number(transferId) || 0 },
                {
                  onSuccess: () => toast(`Deleted "${displayName}".`),
                  onError: (err) =>
                    toast.error(err.message || "Failed to delete type."),
                },
              )
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
