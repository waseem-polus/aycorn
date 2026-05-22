import { useEffect, useRef } from "react";
import { Pencil, PinIcon } from "lucide-react";
import { EditableHeader } from "@/components/EditableHeader";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useProjectMutation } from "@/queries/useProjectMutation";
import type { Project } from "@/types/types";

type ProjectNameCellProps = {
  project: Project;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
};

export function ProjectNameCell({
  project,
  isEditing,
  onStartEdit,
  onStopEdit,
}: ProjectNameCellProps) {
  const { updateProject } = useProjectMutation(project.ID);
  const editableRef = useRef<HTMLHeadingElement>(null);
  const isEmpty = project.Name === "";
  const displayName = isEmpty ? "New Project" : project.Name;

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit();
  };

  const handleSave = (newName: string) => {
    onStopEdit();
    if (newName !== project.Name) {
      updateProject.mutate({ ...project, Name: newName });
    }
  };

  if (isEditing) {
    return (
      <div
        className="min-w-0 flex gap-2 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <EditableHeader
          ref={editableRef}
          value={project.Name}
          setValue={handleSave}
          placeholder="New Project"
          className="text-sm p-0 min-h-0 font-normal"
        />
        {project.Pinned && (
          <PinIcon className="stroke-red-400 size-3 sm:size-4 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span
            className={`truncate group-hover:underline flex gap-2 items-center ${
              isEmpty ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {displayName}
            {project.Pinned && (
              <PinIcon className="stroke-red-400 size-3 sm:size-4 shrink-0" />
            )}
          </span>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="flex w-auto items-center gap-2 py-1.5 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm">{displayName}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={handlePencilClick}
            aria-label="Rename project"
          >
            <Pencil className="size-3.5" />
          </Button>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
