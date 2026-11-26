import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FilterDefinition } from "@/features/saved-filters/filter-definition";
import { SAVED_FILTERS_KEY } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import type {
  SavedFilter,
  SavedFilterPatch,
} from "@/features/saved-filters/saved-filter-types";
import type { BoardView } from "@/features/views/view-types";
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
    mutationFn: (body: { name: string; definition: FilterDefinition; viewId?: number }) =>
      request<SavedFilter>("POST", "/api/filter", {
        name: body.name,
        definition: body.definition,
        viewId: body.viewId ?? null,
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

  const pin = useMutation({
    mutationFn: ({ id, viewId }: { id: number; viewId: number }) =>
      request<boolean>("POST", "/api/filter-pin", { filterId: id, viewId }),
    onSuccess: invalidate,
  });

  const unpin = useMutation({
    mutationFn: ({ id, viewId }: { id: number; viewId: number }) =>
      request<boolean>("DELETE", "/api/filter-pin", { filterId: id, viewId }),
    onSuccess: invalidate,
  });

  /**
   * Replaces a view's pinned filters with `ids`, in order: drag reorder, and
   * the view menu's add / remove. Drag-reorder and membership-toggle
   * carve-outs: the change shows immediately and is rolled back if the server
   * rejects it.
   */
  const setViewFilters = useMutation({
    mutationFn: ({ view, ids }: { view: BoardView; ids: number[] }) =>
      request<BulkResult>("PUT", `/api/view/${view.ID}/filters`, { filterIds: ids }),
    onMutate: async ({ view, ids }) => {
      await queryClient.cancelQueries({ queryKey: SAVED_FILTERS_KEY });
      const previous = queryClient.getQueryData<SavedFilter[]>(SAVED_FILTERS_KEY);
      queryClient.setQueryData<SavedFilter[]>(SAVED_FILTERS_KEY, (old) =>
        old?.map((f) => {
          const others = f.Pins.filter((p) => p.ViewID !== view.ID);
          const position = ids.indexOf(f.ID);
          if (position < 0) return { ...f, Pins: others };
          return {
            ...f,
            Pins: [
              ...others,
              {
                ViewID: view.ID,
                ViewName: view.Name,
                Surface: view.Surface,
                ProjectID: view.ProjectID,
                Position: position,
              },
            ],
          };
        }),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(SAVED_FILTERS_KEY, context.previous);
    },
    onSettled: invalidate,
  });

  return { create, update, duplicate, bulkDelete, pin, unpin, setViewFilters };
}
