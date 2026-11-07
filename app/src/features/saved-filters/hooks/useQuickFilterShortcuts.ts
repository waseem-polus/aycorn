import { useEffect, useRef } from "react";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Alt+1…9 toggle the pinned quick filters in bar order and Alt+0 turns them
 * all off, while the board is mounted. Matches on `code` because Alt+digit
 * types a symbol on macOS.
 */
export function useQuickFilterShortcuts(
  pinnedIds: number[],
  toggle: (id: number) => void,
  clearAll: () => void,
) {
  // Latest values without re-binding the listener every render.
  const latest = useRef({ pinnedIds, toggle, clearAll });
  useEffect(() => {
    latest.current = { pinnedIds, toggle, clearAll };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTypingTarget(e.target)) return;
      const match = /^Digit([0-9])$/.exec(e.code);
      if (!match) return;
      const n = Number(match[1]);
      const { pinnedIds: ids, toggle: flip, clearAll: clear } = latest.current;
      if (n === 0) clear();
      else if (ids[n - 1] !== undefined) flip(ids[n - 1]);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
