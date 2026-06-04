import { useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
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
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { cn } from "@/lib/utils";
import type { TaskTypeGlobal } from "@/types/types";
import { toast } from "sonner";

type Props = {
  type: TaskTypeGlobal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTypeDialog({ type, open, onOpenChange }: Props) {
  const [transferId, setTransferId] = useState<number | null>(null);
  const { data: allTypes = [] } = useTaskTypesQuery();
  const { deleteTaskType } = useTaskTypeMutation();

  const candidates = allTypes.filter((t) => t.ID !== type.ID);
  const hasTasksToTransfer = type.TaskCount > 0;
  const canConfirm = !hasTasksToTransfer || transferId !== null;

  const displayName = type.Name !== "" ? type.Name : "Untitled Type";

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId(null);
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
          <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
            {candidates.map((t) => {
              const selected = transferId === t.ID;
              const name = t.Name !== "" ? t.Name : "Untitled Type";
              return (
                <button
                  key={t.ID}
                  type="button"
                  onClick={() => setTransferId(t.ID)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <DynamicIcon
                    name={t.Icon as any}
                    className={cn("size-4 shrink-0", stageStrokeClass(t.Color))}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {name}
                    </span>
                    {t.TaskCount > 0 && (
                      <span className="block text-xs text-muted-foreground">
                        {t.TaskCount === 1 ? "1 task" : `${t.TaskCount} tasks`}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "size-4 shrink-0 rounded-full border-2 transition-colors",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canConfirm || deleteTaskType.isPending}
            onClick={() =>
              deleteTaskType.mutate(
                { id: type.ID, transferTypeId: transferId ?? 0 },
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
