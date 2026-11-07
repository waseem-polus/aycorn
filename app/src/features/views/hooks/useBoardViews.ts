import { toast } from "sonner";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import { useViewMutations } from "@/features/views/queries/useViewMutations";
import { useViewsQuery } from "@/features/views/queries/useViewsQuery";
import type { BoardView, ViewPatch, ViewType } from "@/features/views/view-types";

/**
 * A board's views and the one being shown. `requestedId` comes from the URL;
 * anything that isn't one of this board's views falls back to the first.
 * Writes report their own failures.
 */
export function useBoardViews(board: Board, requestedId: number | undefined) {
  const { data: views = [], isPending } = useViewsQuery(board);
  const mutations = useViewMutations(board);
  const active: BoardView | null =
    views.find((v) => v.ID === requestedId) ?? views[0] ?? null;

  /** Creates an empty view of `type` (default name, icon and grouping). */
  const create = async (type: ViewType = "list") => {
    try {
      return await mutations.create.mutateAsync(type);
    } catch {
      toast.error("Couldn't create the view. Try again.");
      return null;
    }
  };

  const update = async (id: number, patch: ViewPatch) => {
    try {
      return await mutations.update.mutateAsync({ id, patch });
    } catch {
      toast.error("Couldn't save the view. Try again.");
      return null;
    }
  };

  const duplicate = async (id: number) => {
    try {
      return await mutations.duplicate.mutateAsync(id);
    } catch {
      toast.error("Couldn't duplicate the view. Try again.");
      return null;
    }
  };

  const remove = async (id: number) => {
    if (views.length <= 1) {
      toast.error("A board needs at least one view.");
      return false;
    }
    try {
      await mutations.remove.mutateAsync(id);
      return true;
    } catch {
      toast.error("Couldn't delete the view. Try again.");
      return false;
    }
  };

  const reorder = (ids: number[]) =>
    mutations.reorder.mutate(ids, {
      onError: () => toast.error("Couldn't reorder views. Try again."),
    });

  return { board, views, active, isPending, create, update, duplicate, remove, reorder };
}

export type BoardViewsAPI = ReturnType<typeof useBoardViews>;
