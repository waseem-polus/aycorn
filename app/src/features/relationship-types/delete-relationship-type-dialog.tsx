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
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import type { TaskRelationshipType } from "@/types/types";
import { toast } from "sonner";

type Props = {
  type: TaskRelationshipType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteRelationshipTypeDialog({ type, open, onOpenChange }: Props) {
  const { deleteRelationshipType } = useRelationshipTypeMutation();

  const displayName = type.FromName || type.ToName || "Untitled Type";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {(type.UsageCount ?? 0) > 0
              ? `This will also delete ${type.UsageCount} existing ${type.UsageCount === 1 ? "relationship" : "relationships"} of this type. This action cannot be undone.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteRelationshipType.isPending}
            onClick={() =>
              deleteRelationshipType.mutate(type.ID, {
                onSuccess: () => toast(`Deleted "${displayName}".`),
                onError: () => toast.error("Failed to delete relationship type."),
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
