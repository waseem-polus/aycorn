import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useProjectTaskTypesMutation(projectId: number) {
  const queryClient = useQueryClient();

  const setEnabledTypes = useMutation({
    mutationFn: async (enabledTypeIds: number[]) => {
      const res = await fetch(
        `/api/project/${projectId}/settings/task-types`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabledTypeIds }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectTaskTypeSettings", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projectTaskTypes", projectId],
      });
    },
  });

  return { setEnabledTypes };
}
