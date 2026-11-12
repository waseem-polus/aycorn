import { useHotkeys } from "@tanstack/react-hotkeys";
import type { Hotkey } from "@tanstack/hotkeys";

/** The hotkey for the nth (1-based) view tab. Also drives the tab's tooltip hint. */
export const viewHotkey = (position: number) => `Alt+Shift+${position}` as Hotkey;

/**
 * Alt+Shift+1…9 switch to a board's views in tab order, while the board is
 * mounted. (Alt+digit alone toggles quick filters.)
 */
export function useViewShortcuts(viewIds: number[], select: (id: number) => void) {
  useHotkeys(
    viewIds.slice(0, 9).map((id, i) => ({
      hotkey: viewHotkey(i + 1),
      callback: () => select(id),
    })),
  );
}
