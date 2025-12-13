import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export function EditableProjectName() {
  const { Project, SetProject } = useContext(ProjectContext);

  const [draftProjectName, setDraftProjectName] = useState(Project.Name);

  useEffect(() => {
    setDraftProjectName(Project.Name);
  }, [Project.Name, setDraftProjectName]);

  return (
    <div className="grow flex flex-col text-wrap">
      <input
        value={draftProjectName}
        placeholder="Project Name..."
        className="text-2xl md:text-2xl border outline-0 border-transparent shadow-none"
        minLength={1}
        onChange={(e) => {
          setDraftProjectName(e.target.value);
        }}
        onBlur={() => {
          if (draftProjectName.trim() !== Project.Name)
            toast.promise(
              fetch(`http://localhost:8000/api/project/${Project.ID}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(Project),
              }),
              {
                loading: "Renaming Project",
                success: () => {
                  SetProject({
                    ...Project,
                    Name: draftProjectName,
                  });
                  return "Renamed Project!";
                },
                error: () => {
                  setDraftProjectName(Project.Name);
                  return "Failed Renaming Project :(";
                },
              },
            );
        }}
      />
    </div>
  );
}
