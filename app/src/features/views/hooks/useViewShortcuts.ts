import { useEffect, useRef } from "react";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Alt+Shift+1…9 switch to a board's views in tab order, while the board is
 * mounted. (Alt+digit alone toggles quick filters.) Matches on `code` because
 * modified digits type symbols.
 */
export function useViewShortcuts(viewIds: number[], select: (id: number) => void) {
  const latest = useRef({ viewIds, select });
  useEffect(() => {
    latest.current = { viewIds, select };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      const match = /^Digit([1-9])$/.exec(e.code);
      if (!match) return;
      const id = latest.current.viewIds[Number(match[1]) - 1];
      if (id === undefined) return;
      e.preventDefault();
      latest.current.select(id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
