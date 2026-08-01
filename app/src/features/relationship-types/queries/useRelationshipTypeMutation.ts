import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BEHAVIOR_COLOR } from "@/features/relationship-types/behavior-constants";
import type { BulkResult, TaskRelationshipType } from "@/types/types";

export function useRelationshipTypeMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["taskRelationshipTypes"] });
  };

  // Patches the confirmed change into every cached list (across search/behavior
  // filter variants) instead of invalidating, so editing one row doesn't
  // refetch and re-render the whole table.
  const patchType = (id: number, patch: Partial<TaskRelationshipType>) => {
    queryClient.setQueriesData<TaskRelationshipType[]>(
      { queryKey: ["taskRelationshipTypes"] },
      (old) =>
        old?.map((t) => (t.ID === id ? { ...t, ...patch } : t)),
    );
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
    onSuccess: (_data, type) => {
      patchType(type.ID, {
        FromName: type.FromName,
        ToName: type.ToName,
        Behavior: type.Behavior,
        Icon: type.Icon,
        Color: BEHAVIOR_COLOR[type.Behavior] ?? "gray",
      });
    },
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
    onSuccess: (_data, { id, icon }) => patchType(id, { Icon: icon }),
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
    onSuccess: (_data, { id, fromName, toName }) =>
      patchType(id, { FromName: fromName, ToName: toName }),
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

  const bulkUpdateBehavior = useMutation({
    mutationFn: async ({
      ids,
      behavior,
    }: {
      ids: number[];
      behavior: string;
    }) => {
      const res = await fetch(`/api/task-relationship-type/bulk/behavior`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, behavior }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BulkResult>;
    },
    onSuccess: invalidate,
  });

  const bulkDeleteRelationshipTypes = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(`/api/task-relationship-type/bulk/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BulkResult>;
    },
    onSuccess: invalidate,
  });

  return {
    createRelationshipType,
    updateRelationshipType,
    updateRelationshipTypeIcon,
    updateRelationshipTypeNames,
    deleteRelationshipType,
    bulkUpdateBehavior,
    bulkDeleteRelationshipTypes,
  };
}
