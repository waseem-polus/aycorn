import { useQuery } from "@tanstack/react-query";
import { boardToWire } from "@/features/saved-filters/board";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import type { BoardView } from "@/features/views/view-types";

export const viewsKey = (board: Board) => ["views", boardToWire(board)] as const;

/** A board's views, in tab order. */
export function useViewsQuery(board: Board) {
  return useQuery<BoardView[]>({
    queryKey: viewsKey(board),
    queryFn: async () => {
      const { surface, projectId } = boardToWire(board);
      const params = new URLSearchParams({ surface });
      if (projectId !== null) params.set("projectId", String(projectId));
      const res = await fetch(`/api/view?${params}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
