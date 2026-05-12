import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectMutation } from "@/queries/useProjectMutation";
import type { Project } from "@/types/types";
import { ProjectsListDeleteDialog } from "@/components/projects/projects-list-delete-dialog";

type ProjectRowActionsProps = {
  project: Project;
  onRename: () => void;
};

export function ProjectRowActions({ project, onRename }: ProjectRowActionsProps) {
  const { updateProject } = useProjectMutation(project.ID);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateProject.mutate({ ...project, Pinned: !project.Pinned })
            }
          >
            {project.Pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectsListDeleteDialog
        project={project}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
