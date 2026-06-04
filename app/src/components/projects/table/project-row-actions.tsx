import { useState } from "react";
import {
  MoreHorizontal,
  PinIcon,
  PinOffIcon,
  SettingsIcon,
  TextCursorInputIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import type { Project } from "@/types/types";
import { ProjectsListDeleteDialog } from "@/components/projects/projects-list-delete-dialog";
import { useNavigate } from "@tanstack/react-router";

type ProjectRowActionsProps = {
  project: Project;
  onRename: () => void;
};

export function ProjectRowActions({
  project,
  onRename,
}: ProjectRowActionsProps) {
  const navigate = useNavigate();
  const { updateProject } = useProjectMutation(project.ID);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div
      className="flex gap-1 items-center justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      {project.Pinned && (
        <PinIcon
          className={`${stageStrokeClass("red")} size-4 sm:size-4 shrink-0 sm:hidden`}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename}>
            <TextCursorInputIcon className="text-muted-foreground" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateProject.mutate({ ...project, Pinned: !project.Pinned })
            }
          >
            {project.Pinned ? (
              <PinOffIcon className="text-muted-foreground" />
            ) : (
              <PinIcon className="text-muted-foreground" />
            )}
            {project.Pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: "/project/settings/$projectId",
                params: { projectId: project.ID.toString() },
                search: { tab: "workflow" },
              })
            }
          >
            <SettingsIcon className="text-muted-foreground" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: "/workflow/$workflowId",
                params: { workflowId: project.Workflow.toString() },
              })
            }
          >
            <WorkflowIcon className="text-muted-foreground" />
            Workflow
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="text-muted-foreground" />
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
