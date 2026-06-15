import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskRelationshipType } from "@/types/types";

export function useRelationshipTypeMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["taskRelationshipTypes"] });
  };

  const createRelationshipType = useMutation({
    mutationFn: async (body: {
      fromName: string;
      toName: string;
      behavior: string;
      icon: string;
    }) => {
      const res = await fetch("/api/task-relationship-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: invalidate,
  });

  const updateRelationshipType = useMutation({
    mutationFn: async (
      type: Pick<
        TaskRelationshipType,
        "ID" | "FromName" | "ToName" | "Behavior" | "Icon"
      >,
    ) => {
      const res = await fetch(`/api/task-relationship-type/${type.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: type.FromName,
          toName: type.ToName,
          behavior: type.Behavior,
          icon: type.Icon,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: invalidate,
  });

  const updateRelationshipTypeIcon = useMutation({
    mutationFn: async ({ id, icon }: { id: number; icon: string }) => {
      const res = await fetch(`/api/task-relationship-type/${id}/icon`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: invalidate,
  });

  const updateRelationshipTypeNames = useMutation({
    mutationFn: async ({
      id,
      fromName,
      toName,
    }: {
      id: number;
      fromName: string;
      toName: string;
    }) => {
      const res = await fetch(`/api/task-relationship-type/${id}/names`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromName, toName }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: invalidate,
  });

  const deleteRelationshipType = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/task-relationship-type/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: invalidate,
  });

  return {
    createRelationshipType,
    updateRelationshipType,
    updateRelationshipTypeIcon,
    updateRelationshipTypeNames,
    deleteRelationshipType,
  };
}
