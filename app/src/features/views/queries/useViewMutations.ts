import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardToWire } from "@/features/saved-filters/board";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { viewsKey } from "@/features/views/queries/useViewsQuery";
import type { BoardView, ViewPatch, ViewType } from "@/features/views/view-types";
import type { BulkResult } from "@/types/types";

const request = async <T>(method: string, url: string, body?: unknown): Promise<T> => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
};

/** Every write to a board's views. Each refreshes the board's view list on success. */
export function useViewMutations(board: Board) {
  const queryClient = useQueryClient();
  const key = viewsKey(board);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (type: ViewType) =>
      request<BoardView>("POST", "/api/view", { board: boardToWire(board), type }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: ViewPatch }) =>
      request<BoardView>("PATCH", `/api/view/${id}`, patch),
    // The server's copy (with any grouping it normalized) replaces ours.
    onSuccess: (updated) => {
      queryClient.setQueryData<BoardView[]>(key, (old) =>
        old?.map((v) => (v.ID === updated.ID ? updated : v)),
      );
    },
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => request<BoardView>("POST", `/api/view/${id}/duplicate`),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => request<boolean>("DELETE", `/api/view/${id}`),
    onSuccess: invalidate,
  });

  /**
   * Drag-reorder carve-out: the new order shows immediately and is rolled back
   * if the server rejects it.
   */
  const reorder = useMutation({
    mutationFn: (ids: number[]) =>
      request<BulkResult>("PUT", "/api/view/order", { board: boardToWire(board), viewIds: ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardView[]>(key);
      queryClient.setQueryData<BoardView[]>(key, (old) =>
        old ? [...old].sort((a, b) => ids.indexOf(a.ID) - ids.indexOf(b.ID)) : old,
      );
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: invalidate,
  });

  return { create, update, duplicate, remove, reorder };
}
