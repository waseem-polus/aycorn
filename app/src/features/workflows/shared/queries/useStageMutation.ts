import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import type { Stage } from "@/types/types";

export function useStageMutation(workflowId: number) {
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["workflowDetails", workflowId],
    });
    queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
  };

  const updateStage = useMutation({
    mutationFn: async (stage: Stage) => {
      const res = await fetch(
        `http://localhost:8000/api/stage/${stage.ID}`,
        {
          method: "PUT",
          body: JSON.stringify(stage),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update stage");
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteStage = useMutation({
    mutationFn: async (stageId: number) => {
      const res = await fetch(
        `http://localhost:8000/api/stage/${stageId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete stage");
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const reorderStages = useMutation({
    mutationFn: async (orderedStageIds: number[]) => {
      const res = await fetch(
        `http://localhost:8000/api/workflow/${workflowId}/stages/order`,
        {
          method: "PUT",
          body: JSON.stringify(orderedStageIds),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to reorder stages");
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { updateStage, deleteStage, reorderStages };
}
