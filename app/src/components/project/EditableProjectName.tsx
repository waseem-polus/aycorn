import type { ProjectDetails } from "@/types/types";
import { useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";

export function EditableProjectName({
  projectDetails,
  setProjectDetails,
}: {
  projectDetails: ProjectDetails;
  setProjectDetails: (projectDetails: ProjectDetails) => void;
}) {
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [draftProjectName, setDraftProjectName] = useState(
    projectDetails.Project.Name,
  );

  return (
    <div className="grow flex flex-col text-wrap">
      {!editingProjectName ? (
        <h1
          className="text-2xl py-1 px-3 hover:bg-neutral-50 rounded-md "
          onClick={() => setEditingProjectName(true)}
        >
          {projectDetails.Project.Name}
        </h1>
      ) : (
        <Input
          value={draftProjectName}
          placeholder="Project Name"
          className="text-2xl md:text-2xl"
          autoFocus
          minLength={1}
          onChange={(e) => {
            setDraftProjectName(e.target.value);
          }}
          onBlur={() => {
            setEditingProjectName(false);
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
      )}
    </div>
  );
}
