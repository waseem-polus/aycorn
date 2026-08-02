import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { queryClient } from "@/main";

type DeleteRelationshipInput = {
  relationshipId: number;
  otherTaskId: number;
};

export function useDeleteTaskRelationshipMutation() {
  const { state: task } = useContext(TaskContext);

  return useMutation({
    mutationFn: async (input: DeleteRelationshipInput) => {
      const res = await fetch(`/api/task-relationship/${input.relationshipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", task.ID] });
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", input.otherTaskId] });
    },
    onError: (err) => toast.error(err.message || "Failed to remove relationship."),
  });
}
