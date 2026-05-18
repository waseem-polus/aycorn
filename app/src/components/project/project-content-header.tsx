import { useContext, useRef, useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { EditableProjectName } from "@/components/project/editable-project-name";
import { ProjectDropdownMenu } from "@/components/project/pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "@/components/project/pageHeader/delete-project-dialog";

export function ProjectContentHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const togglePin = () =>
    updateProject.mutate({ ...Project, Pinned: !Project.Pinned });

  return (
    <>
      <div className="flex items-center gap-2">
        <EditableProjectName ref={editableRef} />

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={togglePin}
        >
          {Project.Pinned ? <PinOff /> : <Pin />}
        </Button>

        <ProjectDropdownMenu
          pinned={Project.Pinned}
          onRenameClick={() => {
            setTimeout(() => {
              const el = editableRef.current;
              if (!el) return;
              el.focus();
              const range = document.createRange();
              range.selectNodeContents(el);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            }, 0);
          }}
          onPinClick={togglePin}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
      </div>

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
