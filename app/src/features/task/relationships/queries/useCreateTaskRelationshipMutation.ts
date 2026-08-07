import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/main";

type CreateRelationshipInput = {
  fromTaskId: number;
  toTaskId: number;
  typeId: number;
};

export function useCreateTaskRelationshipMutation() {
  return useMutation({
    mutationFn: async (input: CreateRelationshipInput) => {
      const res = await fetch("/api/task-relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", input.fromTaskId] });
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", input.toTaskId] });
    },
    onError: (err) => toast.error(err.message || "Failed to add relationship."),
  });
}
