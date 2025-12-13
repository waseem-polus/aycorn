import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import type { Project } from "@/types/types";

export function useProjectMutation(projectId: number) {
  const updateProject = useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(
        `http://localhost:8000/api/project/${project.ID}`,
        {
          method: "PUT",
          body: JSON.stringify(project),
        },
      );
      return res.json();
    },
    onSuccess: () => () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["projectDetails", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pinnedProjects"],
        }),
      ]),
  });

  return { updateProject };
}
