import { useContext, useRef, useState } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { EditableProjectName } from "@/components/project/editable-project-name";
import { ProjectDropdownMenu } from "@/components/project/pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "@/components/project/pageHeader/delete-project-dialog";
import { Ellipsis } from "lucide-react";

export function ProjectContentHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);
  const focusAndSelect = useFocusAndSelect(editableRef);

  const togglePin = () =>
    updateProject.mutate({ ...Project, Pinned: !Project.Pinned });

  return (
    <>
      <div className="flex items-center gap-2">
        <EditableProjectName ref={editableRef} />

        <ProjectDropdownMenu
          pinned={Project.Pinned}
          onRenameClick={() => setTimeout(focusAndSelect, 0)}
          onPinClick={togglePin}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        >
          <Ellipsis />
        </ProjectDropdownMenu>
      </div>

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
