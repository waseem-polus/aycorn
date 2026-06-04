import { queryClient } from "@/main";
import type { BulkResult } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
  queryClient.invalidateQueries({ queryKey: ["taskFacets"] });
};

export function useUpcomingBulkMutation() {
  const bulkUpdate = useMutation({
    mutationFn: async ({
      ids,
      changes,
    }: {
      ids: number[];
      changes: Record<string, unknown>;
    }) => {
      const res = await fetch("/api/task/bulk", {
        method: "PUT",
        body: JSON.stringify({ ids, changes }),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as BulkResult;
    },
    onSuccess: (result) => {
      invalidate();
      if (result.failed > 0) toast.error(`${result.failed} failed — try again.`);
    },
    onError: () => toast.error("Bulk update failed — try again."),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/task/bulk/delete", {
        method: "POST",
        body: JSON.stringify(ids),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as BulkResult;
    },
    onSuccess: (result, ids) => {
      invalidate();
      if (result.success > 0)
        toast(`Deleted ${result.success} ${result.success === 1 ? "task" : "tasks"}.`);
      if (result.failed > 0) toast.error(`${result.failed} failed — try again.`);
      if (result.skipped > 0 && ids.length === result.skipped)
        toast(`Nothing to delete.`);
    },
    onError: () => toast.error("Bulk delete failed — try again."),
  });

  return { bulkUpdate, bulkDelete };
}
