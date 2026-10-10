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
import { useProjectMutation } from "@/queries/useProjectMutation";
import type { Project } from "@/types/types";
import { toast } from "sonner";

type Props = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({ project, open, onOpenChange }: Props) {
  const { deleteProject } = useProjectMutation(project.ID);
  const displayName = project.Name !== "" ? project.Name : "New Project";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Delete <b>{displayName}</b>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteProject.isPending}
            onClick={() =>
              deleteProject.mutate(project.ID, {
                onSuccess: () => toast(`Deleted "${displayName}".`),
                onError: () => toast.error("Failed deleting project."),
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
