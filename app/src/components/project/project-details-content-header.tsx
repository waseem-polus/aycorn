import { useRef, useState } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { EditableProjectName } from "@/components/project/editable-project-name";
import { ProjectDropdownMenu } from "@/components/project/pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "@/components/project/pageHeader/delete-project-dialog";
import { Ellipsis } from "lucide-react";

export function ProjectContentHeader() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);
  const focusAndSelect = useFocusAndSelect(editableRef);

  return (
    <>
      <div className="flex items-center gap-2">
        <EditableProjectName ref={editableRef} />

        <ProjectDropdownMenu
          onRenameClick={() => setTimeout(focusAndSelect, 0)}
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
