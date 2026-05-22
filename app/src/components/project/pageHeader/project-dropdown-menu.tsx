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

type ProjectDropdownMenuProps = {
  children?: ReactElement;
  pinned: boolean;
  onRenameClick: () => void;
  onPinClick: () => void;
  onDeleteClick: () => void;
};

export function ProjectDropdownMenu({
  children,
  pinned,
  onRenameClick,
  onPinClick,
  onDeleteClick,
}: ProjectDropdownMenuProps) {
  const navigate = useNavigate();
  const { Project } = useContext(ProjectContext);

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
        <DropdownMenuItem onSelect={onRenameClick}>Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={onPinClick}>
          {pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigate({
              to: "/project/settings/$projectId",
              params: { projectId: Project.ID.toString() },
            })
          }
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDeleteClick}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
