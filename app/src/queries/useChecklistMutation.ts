import { queryClient } from "@/main";
import type { Checklist, ChecklistDetails, ProjectDetails } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const invalidateQueries = (projectId: number) => {
  queryClient.invalidateQueries({ queryKey: ["projectDetails", projectId] });
};

export function useChecklistMutation(projectId: number) {
  const update = useMutation({
    mutationFn: async (checklist: Checklist) => {
      const res = await fetch("/api/checklist", {
        method: "PUT",
        body: JSON.stringify(checklist),
      });
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const create = useMutation({
    mutationFn: async (name: string = "") => {
      const res = await fetch(`/api/checklist/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: name }),
      });
      return await res.json();
    },
    onSuccess: (newChecklist: Checklist) => {
      queryClient.setQueryData<ProjectDetails>(["projectDetails", projectId], (old) => {
        if (!old) return old;
        const details: ChecklistDetails = {
          ...newChecklist,
          TotalCount: 0,
          DoneCount: 0,
          Status: "unused",
          StageCounts: [],
        };
        return { ...old, Checklists: [...old.Checklists, details] };
      });
      invalidateQueries(projectId);
    },
  });

  const deleteChecklist = useMutation({
    mutationFn: async ({
      id,
      transferChecklistId,
    }: {
      id: number;
      transferChecklistId: number;
    }) => {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferChecklistId }),
      });
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  return { update, create, deleteChecklist };
}
