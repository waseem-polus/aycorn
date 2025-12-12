import type { ProjectDetails } from "@/types/types";
import { useState } from "react";
import { toast } from "sonner";

export function EditableProjectName({
  projectDetails,
  setProjectDetails,
}: {
  projectDetails: ProjectDetails;
  setProjectDetails: (projectDetails: ProjectDetails) => void;
}) {
  const [draftProjectName, setDraftProjectName] = useState(
    projectDetails.Project.Name,
  );

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
          if (draftProjectName.trim() !== projectDetails.Project.Name)
            toast.promise(
              fetch(
                `http://localhost:8000/api/project/${projectDetails.Project.ID}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...projectDetails,
                    Project: {
                      ...projectDetails.Project,
                      Name: draftProjectName,
                    },
                  }),
                },
              ),
              {
                loading: "Renaming Project",
                success: () => {
                  setProjectDetails({
                    ...projectDetails,
                    Project: {
                      ...projectDetails.Project,
                      Name: draftProjectName,
                    },
                  });
                  return "Renamed Project!";
                },
                error: () => {
                  setDraftProjectName(projectDetails.Project.Name);
                  return "Failed Renaming Project :(";
                },
              },
            );
        }}
      />
    </div>
  );
}
