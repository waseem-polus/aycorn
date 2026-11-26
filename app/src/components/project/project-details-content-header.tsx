import { useContext, useRef, useState } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { EditableProjectName } from "@/components/project/editable-project-name";
import { ProjectIconPicker } from "@/features/projects/project-icon-picker";
import { ProjectDropdownMenu } from "@/components/project/pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "@/components/project/pageHeader/delete-project-dialog";
import { Ellipsis } from "lucide-react";
import { useProjectPageCommands } from "@/features/projects/hooks/useProjectPageCommands";
import { SwitchWorkflowDialog } from "@/features/settings/project-workflow/switch-workflow-dialog";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function ProjectContentHeader() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);
  const focusAndSelect = useFocusAndSelect(editableRef);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const { Project } = useContext(ProjectContext);

  const workflowSwitch = useProjectPageCommands({
    onRename: focusAndSelect,
    onChangeIcon: () => setIconPickerOpen(true),
    onDelete: () => setIsDeleteDialogOpen(true),
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <ProjectIconPicker
          open={iconPickerOpen}
          onOpenChange={setIconPickerOpen}
        />

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

      {workflowSwitch.switchTarget && (
        <SwitchWorkflowDialog
          open
          onOpenChange={(next) => !next && workflowSwitch.closeSwitchDialog()}
          projectId={Project.ID}
          currentWorkflowName={workflowSwitch.currentWorkflowName}
          fromStages={workflowSwitch.currentStages}
          target={workflowSwitch.switchTarget}
        />
      )}
    </>
  );
}
