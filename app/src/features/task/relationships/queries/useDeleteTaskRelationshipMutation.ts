import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { queryClient } from "@/main";

export function useDeleteTaskRelationshipMutation() {
  const { state: task } = useContext(TaskContext);

  return useMutation({
    mutationFn: async (relationshipId: number) => {
      const res = await fetch(`/api/task-relationship/${relationshipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", task.ID] });
    },
    onError: (err) => toast.error(err.message || "Failed to remove relationship."),
  });
}
