import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import type { BulkResult, Stage, StageType } from "@/types/types";

export function useStageMutation(workflowId: number) {
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["workflowDetails", workflowId],
    });
    queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
  };

  const createStage = useMutation({
    mutationFn: async (type?: Exclude<StageType, "open">) => {
      const res = await fetch(
        `http://localhost:8000/api/workflow/${workflowId}/stage`,
        {
          method: "POST",
          body: JSON.stringify(type ? { type } : {}),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to add stage");
      }
      return res.json() as Promise<Stage>;
    },
    onSuccess: invalidate,
  });

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

  const bulkSetType = useMutation({
    mutationFn: async ({
      ids,
      type,
    }: {
      ids: number[];
      type: Exclude<StageType, "open">;
    }) => {
      const res = await fetch(`http://localhost:8000/api/stage/bulk/type`, {
        method: "PUT",
        body: JSON.stringify({ ids, type }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update stage types");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkSetColor = useMutation({
    mutationFn: async ({ ids, color }: { ids: number[]; color: string }) => {
      const res = await fetch(`http://localhost:8000/api/stage/bulk/color`, {
        method: "PUT",
        body: JSON.stringify({ ids, color }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update stage colors");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkSetIcon = useMutation({
    mutationFn: async ({ ids, icon }: { ids: number[]; icon: string }) => {
      const res = await fetch(`http://localhost:8000/api/stage/bulk/icon`, {
        method: "PUT",
        body: JSON.stringify({ ids, icon }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update stage icons");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkMoveStages = useMutation({
    mutationFn: async ({
      ids,
      beforeId,
    }: {
      ids: number[];
      beforeId: number | null;
    }) => {
      const res = await fetch(
        `http://localhost:8000/api/workflow/${workflowId}/stages/move`,
        {
          method: "PUT",
          body: JSON.stringify({ ids, beforeId }),
        },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to move stages");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkDeleteStages = useMutation({
    mutationFn: async ({
      ids,
      taskMappings,
    }: {
      ids: number[];
      taskMappings?: Record<number, number>;
    }) => {
      const res = await fetch(`http://localhost:8000/api/stage/bulk/delete`, {
        method: "POST",
        body: JSON.stringify({ ids, taskMappings }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete stages");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  return {
    createStage,
    updateStage,
    reorderStages,
    bulkSetType,
    bulkSetColor,
    bulkSetIcon,
    bulkMoveStages,
    bulkDeleteStages,
  };
}
