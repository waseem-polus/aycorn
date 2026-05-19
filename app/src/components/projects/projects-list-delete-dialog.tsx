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

interface ProjectsListDeleteDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectsListDeleteDialog({
  project,
  open,
  onOpenChange,
}: ProjectsListDeleteDialogProps) {
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
            onClick={() =>
              deleteProject.mutate(project.ID, {
                onSuccess: () => toast(`Deleted ${displayName} successfully.`),
                onError: () => toast(`Failed deleting project.`),
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
