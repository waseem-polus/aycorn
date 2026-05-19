import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import type { BulkResult } from "@/types/types";

export type SwitchWorkflowInput = {
  workflowId: number;
  stageMappings: Record<string, number>;
};

export function useProjectWorkflowMutation(projectId: number) {
  const switchWorkflow = useMutation<BulkResult, Error, SwitchWorkflowInput>({
    mutationFn: async ({ workflowId, stageMappings }) => {
      const res = await fetch(
        `http://localhost:8000/api/project/${projectId}/settings/workflow`,
        {
          method: "PUT",
          body: JSON.stringify({ workflowId, stageMappings }),
        },
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectWorkflowSettings", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projectDetails", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["pinnedProjects"] });
      queryClient.invalidateQueries({ queryKey: ["allProjects"] });
      queryClient.invalidateQueries({ queryKey: ["allWorkflows"] });
    },
  });

  return { switchWorkflow };
}
