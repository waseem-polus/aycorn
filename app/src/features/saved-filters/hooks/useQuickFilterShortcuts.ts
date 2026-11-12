import { useHotkeys } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";

/** The hotkey for the nth (1-based) pinned quick filter. Also drives the chip's tooltip hint. */
export const quickFilterHotkey = (position: number) => `Alt+${position}` as Hotkey;

/** Turns every quick filter off. */
export const clearQuickFiltersHotkey = "Alt+0" as Hotkey;

/**
 * Alt+1…9 toggle the pinned quick filters in bar order and Alt+0 turns them
 * all off, while the board is mounted. (Alt+Shift+digit switches views.)
 * Alt combos are ignored while typing in an input by default.
 */
export function useQuickFilterShortcuts(
  pinnedIds: number[],
  toggle: (id: number) => void,
  clearAll: () => void,
) {
  useHotkeys([
    { hotkey: clearQuickFiltersHotkey, callback: clearAll },
    ...pinnedIds.slice(0, 9).map((id, i) => ({
      hotkey: quickFilterHotkey(i + 1),
      callback: () => toggle(id),
    })),
  ]);
}
