import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useContext, type ReactElement } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import {
  PinIcon,
  PinOffIcon,
  SettingsIcon,
  TextCursorInputIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { toast } from "sonner";

type ProjectDropdownMenuProps = {
  children?: ReactElement;
  onRenameClick: () => void;
  onDeleteClick: () => void;
};

export function ProjectDropdownMenu({
  children,
  onRenameClick,
  onDeleteClick,
}: ProjectDropdownMenuProps) {
  const navigate = useNavigate();
  const { Project } = useContext(ProjectContext);

  // Pinning is membership in pinned_project, not a column on project, so it
  // can't go through updateProject.
  const { setPinned } = useProjectMutation(Project.ID);
  const togglePin = () =>
    setPinned.mutate(!Project.Pinned, {
      onError: () => toast.error("Failed to update pin."),
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground size-8"
          size="icon-sm"
        >
          {children}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onSelect={onRenameClick}>
          <TextCursorInputIcon className="text-muted-foreground" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={togglePin}>
          {Project.Pinned ? (
            <PinOffIcon className="text-muted-foreground" />
          ) : (
            <PinIcon className="text-muted-foreground" />
          )}
          {Project.Pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() =>
            navigate({
              to: "/project/settings/$projectId",
              params: { projectId: Project.ID.toString() },
              search: (prev) => ({ ...prev, tab: (prev as { tab?: string }).tab ?? "workflow" }),
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
              params: { workflowId: Project.Workflow.toString() },
            })
          }
        >
          <WorkflowIcon className="text-muted-foreground" />
          Workflow
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={onDeleteClick}>
          <Trash2Icon className="text-muted-foreground" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
