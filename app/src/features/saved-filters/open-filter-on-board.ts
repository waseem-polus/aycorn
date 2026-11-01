import { boardScope } from "@/features/saved-filters/board";
import type { Board } from "@/features/saved-filters/saved-filter-types";

/**
 * Makes a filter the active one on a board before navigating there. Boards
 * read their active filter from storage on mount, so this is the whole
 * hand-off — no URL param to parse and strip.
 */
export const setActiveFilterOnBoard = (board: Board, filterId: number) => {
  try {
    window.localStorage.setItem(`aycorn.${boardScope(board)}.activeFilter`, JSON.stringify(filterId));
  } catch {
    // Storage unavailable: the board just opens on whatever was active.
  }
};
