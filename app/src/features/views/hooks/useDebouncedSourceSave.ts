import { useEffect, useRef, useState } from "react";
import { fromDefinition, treeKey } from "@/features/saved-filters/filter-definition";
import type { ConditionGroup } from "@/features/task-filters/conditions/condition-types";
import type { BoardView } from "@/features/views/view-types";

const SAVE_DELAY_MS = 500;

/**
 * A view's data source while it's being edited: the tree lives here so rows
 * respond instantly, and changes auto-save shortly after the last edit (and
 * when the editor closes). The board filters by the server-confirmed source.
 */
export function useDebouncedSourceSave(
  view: BoardView,
  save: (root: ConditionGroup) => void,
) {
  const [root, setRoot] = useState<ConditionGroup>(() => fromDefinition(view.Source));
  const current = useRef(root);
  const pending = useRef<ConditionGroup | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const latestSave = useRef(save);
  useEffect(() => {
    latestSave.current = save;
  });

  const flush = () => {
    window.clearTimeout(timer.current);
    const next = pending.current;
    pending.current = null;
    if (next) latestSave.current(next);
  };

  /** Applies a tree edit; edits in the same tick compose through the ref. */
  const update = (fn: (root: ConditionGroup) => ConditionGroup) => {
    const prev = current.current;
    const next = fn(prev);
    if (treeKey(next) === treeKey(prev)) return;
    current.current = next;
    setRoot(next);
    pending.current = next;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_DELAY_MS);
  };

  // Closing the editor saves whatever is still waiting.
  useEffect(() => flush, []);

  return { root, update };
}
