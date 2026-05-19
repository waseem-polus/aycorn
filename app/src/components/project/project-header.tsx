import { useContext, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { ProjectDropdownMenu } from "./pageHeader/project-dropdown-menu";
import { DeleteProjectDialog } from "./pageHeader/delete-project-dialog";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const togglePin = () =>
    updateProject.mutate({ ...Project, Pinned: !Project.Pinned });

  return (
    <>
      {Project.TimeModified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-muted-foreground">
              Modified{" "}
              {formatDistanceToNow(new Date(Project.TimeModified), {
                addSuffix: true,
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {format(new Date(Project.TimeModified), "MMM d, yyyy (h:mm a)")}
          </TooltipContent>
        </Tooltip>
      )}

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
        onPinClick={togglePin}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
