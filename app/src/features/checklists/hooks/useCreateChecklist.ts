import { useContext } from "react";
import { toast } from "sonner";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import type { Checklist } from "@/types/types";

/** Creates an empty checklist in the current project and adds it to the project context. */
export const useCreateChecklist = () => {
  const { Checklists, SetChecklists, Project } = useContext(ProjectContext);
  const { create } = useChecklistMutation(Project.ID);

  const createChecklist = (onCreated?: (id: number) => void) =>
    create.mutate("", {
      onSuccess: (newChecklist: Checklist) => {
        SetChecklists([
          ...Checklists,
          {
            TotalCount: 0,
            DoneCount: 0,
            Status: "unused",
            StageCounts: [],
            ...newChecklist,
          },
        ]);
        onCreated?.(newChecklist.ID);
      },
      onError: () => toast.error("Failed to create checklist."),
    });

  return { createChecklist };
};
