import { queryClient } from "@/main";
import type { Checklist } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const invalidateQueries = (projectId: number) => {
  queryClient.invalidateQueries({ queryKey: ["projectDetails", projectId] });
};

export function useChecklistMutation(projectId: number) {
  const update = useMutation({
    mutationFn: async (checklist: Checklist) => {
      const res = await fetch("http://localhost:8000/api/checklist", {
        method: "PUT",
        body: JSON.stringify(checklist),
      });
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `http://localhost:8000/api/checklist/${projectId}`,
        {
          method: "POST",
        },
      );
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  const deleteChecklist = useMutation({
    mutationFn: async (checklistId: number) => {
      const res = await fetch(
        `http://localhost:8000/api/checklist/${checklistId}`,
        {
          method: "DELETE",
        },
      );
      return await res.json();
    },
    onSuccess: () => invalidateQueries(projectId),
  });

  return { update, create, deleteChecklist };
}
