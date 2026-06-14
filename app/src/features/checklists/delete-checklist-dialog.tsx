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
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import type { ChecklistDetails } from "@/types/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { GoalIcon } from "lucide-react";

type Props = {
  checklist: ChecklistDetails;
  candidates: ChecklistDetails[];
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteChecklistDialog({
  checklist,
  candidates,
  projectId,
  open,
  onOpenChange,
}: Props) {
  const [transferId, setTransferId] = useState<number | null>(null);
  const { deleteChecklist } = useChecklistMutation(projectId);

  const displayName =
    checklist.Name !== "" ? checklist.Name : "Untitled Checklist";
  const hasTasksToTransfer = checklist.TotalCount > 0;
  const canConfirm = !hasTasksToTransfer || transferId !== null;

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId(null);
    onOpenChange(next);
  };

  const handleConfirm = () => {
    deleteChecklist.mutate(
      { id: checklist.ID, transferChecklistId: transferId ?? 0 },
      {
        onSuccess: () => toast(`Deleted "${displayName}".`),
        onError: (err) =>
          toast.error(err.message || "Failed to delete checklist."),
      },
    );
  };

  const selectedCandidate =
    transferId !== null ? candidates.find((c) => c.ID === transferId) : null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasTasksToTransfer
              ? `${checklist.TotalCount} ${checklist.TotalCount === 1 ? "task uses" : "tasks use"} this checklist. Choose a destination before deleting.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {checklist.IsDefault && (
          <p className="text-sm text-muted-foreground -mt-2">
            {hasTasksToTransfer && selectedCandidate
              ? `"${selectedCandidate.Name || "Untitled Checklist"}" will become the new default.`
              : "Since this is the default checklist, the next checklist will become the new default."}
          </p>
        )}

        {hasTasksToTransfer && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
            {candidates.map((c) => {
              const selected = transferId === c.ID;
              const name = c.Name !== "" ? c.Name : "Untitled Checklist";
              return (
                <button
                  key={c.ID}
                  type="button"
                  onClick={() => setTransferId(c.ID)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {c.TotalCount === 0
                        ? "No tasks"
                        : `${c.TotalCount} ${c.TotalCount === 1 ? "task" : "tasks"}`}
                    </span>
                  </span>
                  {c.IsDefault && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <GoalIcon />
                      Default
                    </Badge>
                  )}
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
            disabled={!canConfirm || deleteChecklist.isPending}
            onClick={handleConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
