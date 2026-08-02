import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/main";
import type { BulkResult } from "@/types/types";

type BulkCreateRelationshipsInput = {
  typeId: number;
  direction: "from" | "to";
  targetTaskId: number;
  taskIds: number[];
};

export function useBulkCreateTaskRelationshipsMutation() {
  return useMutation({
    mutationFn: async (input: BulkCreateRelationshipsInput) => {
      const res = await fetch("/api/task-relationship/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as BulkResult;
    },
    onSuccess: (_result, input) => {
      for (const id of [...input.taskIds, input.targetTaskId]) {
        queryClient.invalidateQueries({ queryKey: ["taskRelationships", id] });
      }
    },
    onError: (err) => toast.error(err.message || "Failed to add relationships."),
  });
}
