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
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";
import type { Workflow } from "@/types/types";
import { toast } from "sonner";

type DeleteWorkflowDialogProps = {
  workflow: Workflow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteWorkflowDialog({
  workflow,
  open,
  onOpenChange,
  onDeleted,
}: DeleteWorkflowDialogProps) {
  const { deleteWorkflow } = useWorkflowMutation(workflow.ID);
  const displayName =
    workflow.Name !== "" ? workflow.Name : "Untitled Workflow";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workflow</AlertDialogTitle>
          <AlertDialogDescription>
            Delete <b>{displayName}</b>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              deleteWorkflow.mutate(undefined, {
                onSuccess: () => {
                  toast(`Deleted ${displayName} successfully.`);
                  onDeleted?.();
                },
                onError: (err) =>
                  toast(err.message || "Failed deleting workflow."),
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
