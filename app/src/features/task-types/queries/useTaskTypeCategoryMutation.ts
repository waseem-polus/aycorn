import type { TaskTypeCategory } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTaskTypeCategoryMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["taskTypeCategories"] });
    queryClient.invalidateQueries({ queryKey: ["taskTypes"] });
  };

  const createCategory = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/task-type-category", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<TaskTypeCategory>;
    },
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`/api/task-type-category/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: async ({
      id,
      transferCategoryId,
    }: {
      id: number;
      transferCategoryId: number;
    }) => {
      const res = await fetch(`/api/task-type-category/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferCategoryId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  const reorderCategories = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/task-type-category/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<boolean>;
    },
    onSuccess: invalidate,
  });

  return { createCategory, updateCategory, deleteCategory, reorderCategories };
}
