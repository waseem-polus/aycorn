import { Ellipsis, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon-sm"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Pin</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
