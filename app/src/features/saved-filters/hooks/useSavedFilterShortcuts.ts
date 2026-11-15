import { useHotkeys } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";

/** The hotkey for the nth (1-based) pinned saved filter. Also drives the chip's tooltip hint. */
export const savedFilterHotkey = (position: number) => `Alt+${position}` as Hotkey;

/** Turns every saved filter off. */
export const clearSavedFiltersHotkey = "Alt+0" as Hotkey;

/**
 * Alt+1…9 toggle the pinned saved filters in bar order and Alt+0 turns them
 * all off, while the board is mounted. (Alt+Shift+digit switches views.)
 * Alt combos are ignored while typing in an input by default.
 */
export function useSavedFilterShortcuts(
  pinnedIds: number[],
  toggle: (id: number) => void,
  clearAll: () => void,
) {
  useHotkeys([
    { hotkey: clearSavedFiltersHotkey, callback: clearAll },
    ...pinnedIds.slice(0, 9).map((id, i) => ({
      hotkey: savedFilterHotkey(i + 1),
      callback: () => toggle(id),
    })),
  ]);
}
