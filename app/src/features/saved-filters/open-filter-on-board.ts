import { boardScope } from "@/features/saved-filters/board";
import { activeFiltersKey } from "@/features/saved-filters/hooks/useQuickFilters";
import type { Board } from "@/features/saved-filters/saved-filter-types";

/**
 * Toggles a filter on for a board before navigating there. Boards read their
 * toggled filters from storage on mount, so this is the whole hand-off — no
 * URL param to parse and strip.
 */
export const setActiveFilterOnBoard = (board: Board, filterId: number) => {
  try {
    const key = activeFiltersKey(boardScope(board));
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    const ids = Array.isArray(stored) ? stored.filter((x): x is number => typeof x === "number") : [];
    if (!ids.includes(filterId)) ids.push(filterId);
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Storage unavailable: the board just opens with whatever was toggled.
  }
};
