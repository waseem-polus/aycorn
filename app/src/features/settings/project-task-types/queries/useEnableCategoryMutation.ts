import type { BulkResult } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEnableCategoryMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      const res = await fetch(
        `/api/project/${projectId}/settings/task-types/bulk/enable-category`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BulkResult>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectTaskTypeSettings", projectId],
      });
    },
  });
}
