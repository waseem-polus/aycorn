import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardToWire, pinIsOnBoard } from "@/features/saved-filters/board";
import type { FilterDefinition } from "@/features/saved-filters/filter-definition";
import { SAVED_FILTERS_KEY } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import type {
  Board,
  SavedFilter,
  SavedFilterPatch,
} from "@/features/saved-filters/saved-filter-types";
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

/** Every saved-filter write. Each one refreshes the shared filter list on success. */
export function useSavedFilterMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: SAVED_FILTERS_KEY });

  const create = useMutation({
    mutationFn: (body: { name: string; definition: FilterDefinition; pin?: Board }) =>
      request<SavedFilter>("POST", "/api/filter", {
        name: body.name,
        definition: body.definition,
        pin: body.pin ? boardToWire(body.pin) : null,
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: SavedFilterPatch }) =>
      request<boolean>("PATCH", `/api/filter/${id}`, patch),
    onSuccess: invalidate,
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => request<SavedFilter>("POST", `/api/filter/${id}/duplicate`),
    onSuccess: invalidate,
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: number[]) => request<BulkResult>("POST", "/api/filter/bulk/delete", { ids }),
    onSuccess: invalidate,
  });

  const setPins = useMutation({
    mutationFn: ({ id, boards }: { id: number; boards: Board[] }) =>
      request<boolean>("PUT", `/api/filter/${id}/pins`, { boards: boards.map(boardToWire) }),
    onSuccess: invalidate,
  });

  const pin = useMutation({
    mutationFn: ({ id, board }: { id: number; board: Board }) =>
      request<boolean>("POST", "/api/filter-pin", { filterId: id, board: boardToWire(board) }),
    onSuccess: invalidate,
  });

  const unpin = useMutation({
    mutationFn: ({ id, board }: { id: number; board: Board }) =>
      request<boolean>("DELETE", "/api/filter-pin", { filterId: id, board: boardToWire(board) }),
    onSuccess: invalidate,
  });

  /**
   * Drag-reorder carve-out: the new order shows immediately and is rolled back
   * if the server rejects it.
   */
  const reorder = useMutation({
    mutationFn: ({ board, ids }: { board: Board; ids: number[] }) =>
      request<BulkResult>("PUT", "/api/filter-pin/order", { board: boardToWire(board), filterIds: ids }),
    onMutate: async ({ board, ids }) => {
      await queryClient.cancelQueries({ queryKey: SAVED_FILTERS_KEY });
      const previous = queryClient.getQueryData<SavedFilter[]>(SAVED_FILTERS_KEY);
      queryClient.setQueryData<SavedFilter[]>(SAVED_FILTERS_KEY, (old) =>
        old?.map((f) => ({
          ...f,
          Pins: f.Pins.map((p) =>
            pinIsOnBoard(p, board) ? { ...p, Position: ids.indexOf(f.ID) } : p,
          ),
        })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(SAVED_FILTERS_KEY, context.previous);
    },
    onSettled: invalidate,
  });

  return { create, update, duplicate, bulkDelete, setPins, pin, unpin, reorder };
}
