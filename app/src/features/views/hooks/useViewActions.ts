import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import type { BoardView } from "@/features/views/view-types";

/**
 * The actions a view's menu offers — move, duplicate, delete (confirmed) —
 * shared by the tab strip and the toolbar's settings button. The caller
 * renders a `DeleteViewDialog` for `deleting`.
 */
export function useViewActions(
  api: BoardViewsAPI,
  selectedId: number | null,
  onSelect: (id: number) => void,
) {
  const { views } = api;
  const [deleting, setDeleting] = useState<BoardView | null>(null);

  const move = (id: number, delta: -1 | 1) => {
    const ids = views.map((v) => v.ID);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    api.reorder(arrayMove(ids, from, to));
  };

  const duplicate = async (id: number) => {
    const created = await api.duplicate(id);
    if (created) onSelect(created.ID);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const index = views.findIndex((v) => v.ID === deleting.ID);
    const removed = await api.remove(deleting.ID);
    setDeleting(null);
    if (!removed || deleting.ID !== selectedId) return;
    const neighbour = views[index + 1] ?? views[index - 1];
    if (neighbour) onSelect(neighbour.ID);
  };

  return { deleting, setDeleting, move, duplicate, confirmDelete };
}
