import { useCallback, useEffect, type RefObject } from "react";

export function useFocusAndSelect(
  ref: RefObject<HTMLElement | null>,
  condition?: boolean,
) {
  const focusAndSelect = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [ref]);

  useEffect(() => {
    if (condition) focusAndSelect();
  }, [condition, focusAndSelect]);

  return focusAndSelect;
}
