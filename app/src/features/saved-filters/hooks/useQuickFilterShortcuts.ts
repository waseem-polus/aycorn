import { useEffect, useRef } from "react";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Alt+0 picks the scratch filter, Alt+1…9 the pinned filters in bar order,
 * while the board is mounted. Matches on `code` because Alt+digit types a
 * symbol on macOS.
 */
export function useQuickFilterShortcuts(pinnedIds: number[], activate: (id: number | null) => void) {
  // Latest values without re-binding the listener every render.
  const latest = useRef({ pinnedIds, activate });
  useEffect(() => {
    latest.current = { pinnedIds, activate };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      const match = /^Digit([0-9])$/.exec(e.code);
      if (!match) return;
      const n = Number(match[1]);
      const { pinnedIds: ids, activate: go } = latest.current;
      if (n === 0) go(null);
      else if (ids[n - 1] !== undefined) go(ids[n - 1]);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
