import { useMemo, type SetStateAction } from "react";
import { useLocalStorage } from "@/features/calendar/hooks";
import {
  EMPTY_FILTER_STATE,
  fromDefinition,
  type FilterDefinition,
  type FilterState,
} from "@/features/saved-filters/filter-definition";
import { createRoot } from "@/features/task-filters/conditions/condition-tree-ops";
import { upgradeGroup } from "@/features/task-filters/conditions/condition-upgrade";
import type {
  ConditionGroup,
  StoredConditions,
} from "@/features/task-filters/conditions/condition-types";
import {
  EMPTY_PERSISTED_FILTERS,
  type PersistedFilterState,
} from "@/features/task-filters/task-filters";

/**
 * Which filter a board is editing: its scratch filter, or a saved one. A
 * saved slot carries the committed definition its draft falls back to.
 */
export type FilterSlot =
  | { kind: "scratch" }
  | { kind: "saved"; id: number; definition: FilterDefinition };

export const draftStorageKey = (scope: string, filterId: number | "none") =>
  `aycorn.${scope}.draft.${filterId}`;

const rootOf = (stored: StoredConditions | null): ConditionGroup =>
  // Known envelopes are upgraded; anything else (a hand-edited value) starts
  // fresh rather than feeding the builder a tree it can't read.
  (stored?.version === 1 || stored?.version === 2) && stored.root?.kind === "group"
    ? upgradeGroup(stored.root)
    : createRoot();

const isFilterState = (value: unknown): value is FilterState =>
  !!value &&
  typeof value === "object" &&
  "root" in value &&
  (value as FilterState).root?.kind === "group" &&
  "basic" in value;

const apply = <T,>(action: SetStateAction<T>, prev: T): T =>
  action instanceof Function ? action(prev) : action;

/**
 * Where a board's filter state lives, per slot:
 *
 * - **Scratch** keeps the phase 1–2 keys (`aycorn.<scope>.filters` and
 *   `.conditions`), so existing filters carry over untouched.
 * - **Saved** keeps an editing draft at `aycorn.<scope>.draft.<id>`. With no
 *   draft the state is the saved definition itself — not dirty, nothing
 *   stored. Drafts keep node ids so rows don't remount while editing.
 *
 * Every write is a functional update on a single key, so rapid edits compose.
 */
export function useFilterSlotState(scope: string, slot: FilterSlot) {
  const [scratchBasic, setScratchBasic] = useLocalStorage<PersistedFilterState>(
    `aycorn.${scope}.filters`,
    EMPTY_PERSISTED_FILTERS,
  );
  const [scratchConditions, setScratchConditions] = useLocalStorage<StoredConditions | null>(
    `aycorn.${scope}.conditions`,
    null,
  );
  const [storedDraft, setDraft] = useLocalStorage<FilterState | null>(
    draftStorageKey(scope, slot.kind === "saved" ? slot.id : "none"),
    null,
  );

  // Fresh ids per definition, not per render: keyed on content so a refetch
  // of the same definition keeps the same rows.
  const definitionJson = slot.kind === "saved" ? JSON.stringify(slot.definition) : "";
  const base = useMemo(
    () => (definitionJson ? fromDefinition(JSON.parse(definitionJson)) : EMPTY_FILTER_STATE),
    [definitionJson],
  );

  const draft =
    slot.kind === "saved" && isFilterState(storedDraft)
      ? { ...storedDraft, root: upgradeGroup(storedDraft.root) }
      : null;
  const state: FilterState =
    slot.kind === "scratch"
      ? { basic: { ...EMPTY_PERSISTED_FILTERS, ...scratchBasic }, root: rootOf(scratchConditions) }
      : (draft ?? base);

  const updateDraft = (fn: (current: FilterState) => FilterState) =>
    setDraft((prev) => fn(isFilterState(prev) ? { ...prev, root: upgradeGroup(prev.root) } : base));

  const setBasic = (action: SetStateAction<PersistedFilterState>) => {
    if (slot.kind === "scratch") return setScratchBasic(action);
    updateDraft((cur) => ({ ...cur, basic: apply(action, cur.basic) }));
  };

  const setRoot = (fn: (root: ConditionGroup) => ConditionGroup) => {
    if (slot.kind === "scratch") {
      return setScratchConditions((prev) => ({ version: 2, root: fn(rootOf(prev)) }));
    }
    updateDraft((cur) => ({ ...cur, root: fn(cur.root) }));
  };

  /** Replaces the whole state (undo, reset, promoting scratch). */
  const replace = (next: FilterState) => {
    setBasic(next.basic);
    setRoot(() => next.root);
  };

  return {
    state,
    setBasic,
    setRoot,
    replace,
    hasDraft: draft !== null,
    /** Drops a saved slot's draft, reverting to the committed definition. */
    clearDraft: () => setDraft(null),
  };
}
