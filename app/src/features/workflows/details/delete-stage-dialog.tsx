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
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import type { Stage } from "@/types/types";
import { toast } from "sonner";

type DeleteStageDialogProps = {
  stage: Stage;
  workflowId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteStageDialog({
  stage,
  workflowId,
  open,
  onOpenChange,
}: DeleteStageDialogProps) {
  const { deleteStage } = useStageMutation(workflowId);
  const displayName = stage.Name !== "" ? stage.Name : "Untitled stage";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete stage</AlertDialogTitle>
          <AlertDialogDescription>
            Delete <b>{displayName}</b>? Tasks currently in this stage will need
            to be reassigned. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              deleteStage.mutate(stage.ID, {
                onSuccess: () => toast(`Deleted ${displayName} successfully.`),
                onError: (err) =>
                  toast(err.message || "Failed deleting stage."),
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
