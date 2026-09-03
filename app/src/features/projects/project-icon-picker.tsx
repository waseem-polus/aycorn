import { useContext } from "react";
import { toast } from "sonner";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { IconColorPicker } from "@/features/icon-picker/icon-color-picker";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useProjectMutation } from "@/queries/useProjectMutation";
import type { Project } from "@/types/types";
import { cn } from "@/lib/utils";

/**
 * The project's icon beside its editable name, click-to-edit. The card version
 * is read-only (see project-card.tsx) because the card navigates on click.
 */
export function ProjectIconPicker() {
  const { Project, SetProject } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

  const save = (patch: Partial<Project>) => {
    const next = { ...Project, ...patch };
    SetProject(next);
    updateProject.mutate(next, {
      onError: () => {
        SetProject(Project);
        toast.error("Failed to update project.");
      },
    });
  };

  return (
    <IconColorPicker
      iconValue={Project.Icon}
      colorValue={Project.Color}
      onIconSelect={(icon) => save({ Icon: icon })}
      onColorSelect={(color) => save({ Color: color })}
      iconClassName={cn(stageStrokeClass(Project.Color), "size-8 stroke-[1.7]")}
      buttonSize="icon-lg"
    />
  );
}
