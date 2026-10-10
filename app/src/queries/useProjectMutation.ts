import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BulkResult, Project } from "@/types/types";

export function useProjectMutation(projectId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projectDetails", projectId] });
    queryClient.invalidateQueries({ queryKey: ["pinnedProjects"] });
    queryClient.invalidateQueries({ queryKey: ["allProjects"] });
  };

  const updateProject = useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(`/api/project/${project.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: invalidate,
  });

  // Pinning is membership in pinned_project, not a column on project, so it
  // can't ride along on updateProject. The bulk endpoint is the only pin write
  // path — a single project is just a one-element batch.
  const setPinned = useMutation({
    mutationFn: async (pinned: boolean) => {
      const res = await fetch(`/api/project/bulk/pinned`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [projectId], pinned }),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const setArchived = useMutation({
    mutationFn: async (archived: boolean) => {
      const res = await fetch(`/api/project/bulk/archived`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [projectId], archived }),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as BulkResult;
    },
    onSuccess: invalidate,
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { updateProject, setPinned, setArchived, deleteProject };
}
