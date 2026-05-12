import { useContext, useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { ProjectDropdownMenu } from "./pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "./pageHeader/delete-project-dialog";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          updateProject.mutate({ ...Project, Pinned: !Project.Pinned });
        }}
      >
        {Project.Pinned ? <PinOff /> : <Pin />}
      </Button>

      <ProjectDropdownMenu onDeleteClick={() => setIsDeleteDialogOpen(true)} />

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
