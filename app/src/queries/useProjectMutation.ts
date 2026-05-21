import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import type { Project } from "@/types/types";

export function useProjectMutation(projectId: number) {
  const updateProject = useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(
        `/api/project/${project.ID}`,
        {
          method: "PUT",
          body: JSON.stringify(project),
        },
      );

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectDetails", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pinnedProjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allProjects"],
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(
        `/api/project/${projectId}`,
        {
          method: "DELETE",
        },
      );

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectDetails", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pinnedProjects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allProjects"],
      });
    },
  });

  return { updateProject, deleteProject };
}
