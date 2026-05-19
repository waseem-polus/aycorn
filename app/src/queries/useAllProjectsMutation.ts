import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import type { Project } from "@/types/types";

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
      projects,
      pinned,
    }: {
      projects: Project[];
      pinned: boolean;
    }) => {
      await Promise.all(
        projects.map((p) =>
          fetch(`http://localhost:8000/api/project/${p.ID}`, {
            method: "PUT",
            body: JSON.stringify({ ...p, Pinned: pinned }),
          }),
        ),
      );
    },
    onSuccess: invalidate,
  });

  const bulkDelete = useMutation({
    mutationFn: async (projectIds: number[]) => {
      await Promise.all(
        projectIds.map((id) =>
          fetch(`http://localhost:8000/api/project/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    },
    onSuccess: invalidate,
  });

  return { createProject, bulkSetPinned, bulkDelete };
}
