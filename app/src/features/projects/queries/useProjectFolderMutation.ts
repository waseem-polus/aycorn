import type { ProjectFolder } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useProjectFolderMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projectFolders"] });
    queryClient.invalidateQueries({ queryKey: ["allProjects"] });
  };

  const createFolder = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/project-folder", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<ProjectFolder>;
    },
    onSuccess: invalidate,
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`/api/project-folder/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const deleteFolder = useMutation({
    mutationFn: async ({
      id,
      transferFolderId,
    }: {
      id: number;
      transferFolderId?: number;
    }) => {
      const res = await fetch(`/api/project-folder/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferFolderId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const reorderFolders = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/project-folder/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  return { createFolder, updateFolder, deleteFolder, reorderFolders };
}
