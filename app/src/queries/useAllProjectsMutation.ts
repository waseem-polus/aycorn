import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BulkResult } from "@/types/types";

export function useAllProjectsMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["allProjects"] });
    queryClient.invalidateQueries({ queryKey: ["pinnedProjects"] });
  };

  const createProject = useMutation({
    mutationFn: async (body: { workflowId: number; folder?: number }) => {
      const res = await fetch(`/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to create project");
      }
      return (await res.json()) as number;
    },
    onSuccess: invalidate,
  });

  const bulkSetPinned = useMutation({
    mutationFn: async ({ ids, pinned }: { ids: number[]; pinned: boolean }) => {
      const res = await fetch(`/api/project/bulk/pinned`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, pinned }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update projects");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkSetArchived = useMutation({
    mutationFn: async ({
      ids,
      archived,
    }: {
      ids: number[];
      archived: boolean;
    }) => {
      const res = await fetch(`/api/project/bulk/archived`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, archived }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update projects");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkSetFolder = useMutation({
    mutationFn: async ({ ids, folder }: { ids: number[]; folder: number }) => {
      const res = await fetch(`/api/project/bulk/folder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, folder }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to move projects");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const duplicateProjectConfig = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/api/project/${projectId}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to duplicate project");
      }
      return (await res.json()) as { id: number };
    },
    onSuccess: invalidate,
  });

  const reorderPinnedProjects = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(`/api/project/pinned/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to reorder pinned projects");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(`/api/project/bulk/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete projects");
      }
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  return {
    createProject,
    bulkSetPinned,
    bulkSetArchived,
    bulkSetFolder,
    duplicateProjectConfig,
    reorderPinnedProjects,
    bulkDelete,
  };
}
