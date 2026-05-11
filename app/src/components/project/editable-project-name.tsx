import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useContext } from "react";
import { EditableHeader } from "../EditableHeader";
import { useProjectMutation } from "@/queries/useProjectMutation";

export function EditableProjectName() {
  const { Project, SetProject } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

  return (
    <div className="grow flex flex-col text-wrap">
      <EditableHeader
        value={Project.Name}
        setValue={(newName) => {
          if (newName !== Project.Name) {
            SetProject({
              ...Project,
              Name: newName,
            });
            updateProject.mutate({
              ...Project,
              Name: newName,
            });
          }
        }}
        placeholder="New Project..."
      />
    </div>
  );
}
