import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { queryClient } from "@/main";

type CreateRelationshipInput = {
  fromTaskId: number;
  toTaskId: number;
  typeId: number;
};

export function useCreateTaskRelationshipMutation() {
  const { state: task } = useContext(TaskContext);

  return useMutation({
    mutationFn: async (input: CreateRelationshipInput) => {
      const res = await fetch("/api/task-relationship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskRelationships", task.ID] });
    },
    onError: (err) => toast.error(err.message || "Failed to add relationship."),
  });
}
