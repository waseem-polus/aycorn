import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import type { BulkResult } from "@/types/types";

export function useAllProjectsMutation() {
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["allProjects"] });
    queryClient.invalidateQueries({ queryKey: ["pinnedProjects"] });
  };

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:8000/api/project`, {
        method: "POST",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProjects"] });
    },
  });

  const bulkSetPinned = useMutation({
    mutationFn: async ({
      ids,
      pinned,
    }: {
      ids: number[];
      pinned: boolean;
    }) => {
      const res = await fetch(`http://localhost:8000/api/project/bulk/pinned`, {
        method: "PUT",
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

  const bulkDelete = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(`http://localhost:8000/api/project/bulk/delete`, {
        method: "POST",
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

  return { createProject, bulkSetPinned, bulkDelete };
}
