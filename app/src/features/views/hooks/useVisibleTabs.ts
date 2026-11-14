import { useCallback, useLayoutEffect, useRef, useState } from "react";

// Space the tab strip's chrome takes, besides the tabs: the add-view button
// beside the pill, the pill's padding, and the `+N` overflow trigger.
const ADD_BUTTON_WIDTH = 36;
const PILL_PADDING = 6;
const OVERFLOW_TRIGGER_WIDTH = 60;
const TAB_GAP = 2;
const FALLBACK_TAB_WIDTH = 110;

type Options = {
  rowRef: React.RefObject<HTMLElement | null>;
  /** Each tab's button, by position; its parent is the tab's full box. */
  tabButtons: React.RefObject<(HTMLButtonElement | null)[]>;
  ids: number[];
  selectedId: number | null;
  enabled: boolean;
};

/**
 * Which view tabs fit the row. Returns the ids to show, or `null` when every
 * tab fits. The selected tab is always shown; the rest fill the remaining
 * width in order. Tabs are measured wherever they are (hidden ones stay
 * mounted, just invisible), so measuring never depends on the result.
 */
export function useVisibleTabs({
  rowRef,
  tabButtons,
  ids,
  selectedId,
  enabled,
}: Options): Set<number> | null {
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const widths = useRef(new Map<number, number>());
  const idsKey = ids.join(",");

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!enabled || !row) return;
    ids.forEach((id, i) => {
      const width = tabButtons.current[i]?.parentElement?.offsetWidth;
      if (width) widths.current.set(id, width);
    });
    const widthOf = (id: number) =>
      (widths.current.get(id) ?? FALLBACK_TAB_WIDTH) + TAB_GAP;

    const available = row.clientWidth - ADD_BUTTON_WIDTH - PILL_PADDING;
    const total = ids.reduce((sum, id) => sum + widthOf(id), 0);
    if (total <= available) {
      setVisibleKey(null);
      return;
    }

    const budget = available - OVERFLOW_TRIGGER_WIDTH;
    const chosen = new Set<number>();
    let used = 0;
    if (selectedId !== null && ids.includes(selectedId)) {
      chosen.add(selectedId);
      used += widthOf(selectedId);
    }
    for (const id of ids) {
      if (chosen.has(id)) continue;
      if (used + widthOf(id) > budget) break;
      chosen.add(id);
      used += widthOf(id);
    }
    setVisibleKey(ids.filter((id) => chosen.has(id)).join(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, idsKey, selectedId, rowRef, tabButtons]);

  // Re-measure after every render: a rename or icon change resizes a tab
  // without changing anything above. `measure` only sets state on a change.
  useLayoutEffect(() => {
    measure();
  });

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!enabled || !row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [enabled, measure, rowRef]);

  if (visibleKey === null) return null;
  return new Set(visibleKey === "" ? [] : visibleKey.split(",").map(Number));
}
