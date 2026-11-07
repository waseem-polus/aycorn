import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/features/calendar/hooks";
import { boardFilters, boardScope } from "@/features/saved-filters/board";
import {
  fromDefinition,
  toDefinition,
  treeKey,
} from "@/features/saved-filters/filter-definition";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import { useSavedFiltersQuery } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import type { Board, SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import { createRoot } from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  ConditionGroup,
  WireGroup,
} from "@/features/task-filters/conditions/condition-types";
import { upgradeGroup } from "@/features/task-filters/conditions/condition-upgrade";
import { toWire } from "@/features/task-filters/conditions/condition-wire";
import { useToday } from "@/features/task-filters/hooks/useToday";

type Drafts = Record<string, ConditionGroup>;

export const activeFiltersKey = (scope: string) => `aycorn.${scope}.activeFilters`;

const isTree = (value: unknown): value is ConditionGroup =>
  !!value && typeof value === "object" && (value as ConditionGroup).kind === "group";

/**
 * A board's quick filters: the saved filters pinned to it, which of them are
 * toggled on, and their unsaved edits. Toggled filters stack — the server ANDs
 * every tree in `wires`.
 *
 * Edits are local drafts, one per filter, kept together under
 * `aycorn.<scope>.drafts` so every chip's unsaved dot updates as you type.
 * `save` commits a draft to the shared filter; `discard` drops it.
 */
export function useQuickFilters(board: Board) {
  const scope = boardScope(board);
  const { data: savedFilters = [], isPending } = useSavedFiltersQuery();
  const mutations = useSavedFilterMutations();
  const pinned = boardFilters(savedFilters, board);

  const [activeIds, setActiveIds] = useLocalStorage<number[]>(activeFiltersKey(scope), []);
  const [drafts, setDrafts] = useLocalStorage<Drafts>(`aycorn.${scope}.drafts`, {});

  // Saved trees get fresh node ids when parsed. Keyed on the definitions'
  // content, so a refetch that only renamed or re-pinned keeps the same ids
  // and an open editor's rows don't remount.
  const definitionsKey = JSON.stringify(savedFilters.map((f) => [f.ID, f.Definition]));
  const savedTrees = useMemo(
    () => new Map(savedFilters.map((f) => [f.ID, fromDefinition(f.Definition)])),
    // savedFilters is read through its content key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [definitionsKey],
  );
  const savedTree = (filter: SavedFilter): ConditionGroup =>
    savedTrees.get(filter.ID) ?? fromDefinition(filter.Definition);

  const draftOf = (id: number): ConditionGroup | null => {
    const draft = drafts[id];
    return isTree(draft) ? upgradeGroup(draft) : null;
  };

  const find = (id: number) => pinned.find((f) => f.ID === id) ?? null;

  /** The tree a filter applies right now: its draft, else what's saved. */
  const treeOf = (filter: SavedFilter): ConditionGroup => draftOf(filter.ID) ?? savedTree(filter);

  const isEdited = (filter: SavedFilter): boolean => {
    const draft = draftOf(filter.ID);
    return !!draft && treeKey(draft) !== treeKey(savedTree(filter));
  };

  const active = pinned.filter((f) => activeIds.includes(f.ID));

  // Drop state for filters that left the board (deleted, or unpinned
  // elsewhere) once the list has loaded.
  useEffect(() => {
    if (isPending) return;
    const ids = new Set(pinned.map((f) => f.ID));
    if (activeIds.some((id) => !ids.has(id))) {
      setActiveIds((prev) => prev.filter((id) => ids.has(id)));
    }
    if (Object.keys(drafts).some((id) => !ids.has(Number(id)))) {
      setDrafts((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([id]) => ids.has(Number(id)))),
      );
    }
  }, [isPending, pinned, activeIds, drafts, setActiveIds, setDrafts]);

  const today = useToday();
  const { weekStartsOn } = useAppSettingsQuery().settings;
  const activeTrees = active.map(treeOf);
  const activeKey = activeTrees.map(treeKey).join("|");
  // Relative dates resolve here, so a new day (or week start) re-sends them.
  const wires = useMemo(
    () =>
      activeTrees
        .map((tree) => toWire(tree, { today, weekStartsOn }))
        .filter((w): w is WireGroup => w !== null),
    // activeTrees is rebuilt every render; its content key is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeKey, today, weekStartsOn],
  );

  const setActive = (id: number, on: boolean) =>
    setActiveIds((prev) =>
      on ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id),
    );

  const toggle = (id: number) =>
    setActiveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const clearDraft = (id: number) =>
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  /** Applies a tree edit to a filter's draft, starting one from what's saved. */
  const updateTree = (id: number, fn: (root: ConditionGroup) => ConditionGroup) => {
    const filter = find(id);
    if (!filter) return;
    setDrafts((prev) => {
      const current = isTree(prev[id]) ? upgradeGroup(prev[id]) : savedTree(filter);
      return { ...prev, [id]: fn(current) };
    });
  };

  /** Commits a filter's draft to the shared filter. */
  const save = async (id: number) => {
    const filter = find(id);
    if (!filter) return;
    try {
      await mutations.update.mutateAsync({ id, patch: { definition: toDefinition(treeOf(filter)) } });
      clearDraft(id);
      toast.success(`Saved “${filter.Name}”.`);
    } catch {
      toast.error("Couldn't save the filter. Try again.");
    }
  };

  /**
   * Creates a filter pinned to this board and toggles it on. Returns it, or
   * null when the request failed (already reported).
   */
  const create = async (name: string, root: ConditionGroup = createRoot()) => {
    try {
      const created = await mutations.create.mutateAsync({
        name,
        definition: toDefinition(root),
        pin: board,
      });
      setActive(created.ID, true);
      return created;
    } catch {
      toast.error("Couldn't create the filter. Try again.");
      return null;
    }
  };

  /**
   * Saves a filter's current state as a new filter. The edits move to the new
   * one, which takes the original's place among the toggled filters; the
   * original reverts to what's saved.
   */
  const saveAsNew = async (id: number, name: string) => {
    const filter = find(id);
    if (!filter) return;
    const created = await create(name, treeOf(filter));
    if (!created) return;
    clearDraft(id);
    setActive(id, false);
    toast.success(`Saved “${created.Name}”.`);
  };

  const pin = async (id: number) => {
    try {
      await mutations.pin.mutateAsync({ id, board });
      setActive(id, true);
    } catch {
      toast.error("Couldn't add the filter. Try again.");
    }
  };

  const unpin = async (id: number) => {
    try {
      await mutations.unpin.mutateAsync({ id, board });
    } catch {
      toast.error("Couldn't remove the filter. Try again.");
    }
  };

  const rename = async (id: number, name: string) => {
    try {
      await mutations.update.mutateAsync({ id, patch: { name } });
    } catch {
      toast.error("Couldn't rename the filter. Try again.");
    }
  };

  const reorder = (ids: number[]) =>
    mutations.reorder.mutate(
      { board, ids },
      { onError: () => toast.error("Couldn't reorder filters. Try again.") },
    );

  return {
    board,
    savedFilters,
    pinned,
    active,
    isActive: (id: number) => activeIds.includes(id),
    isEdited,
    treeOf,
    /** One wire tree per toggled filter with anything to apply. */
    wires,
    /** False while toggled filters are still loading, so queries don't fetch unfiltered first. */
    ready: !(isPending && activeIds.length > 0),
    toggle,
    setActive,
    clearAll: () => setActiveIds([]),
    updateTree,
    save,
    saveAsNew,
    discard: clearDraft,
    create,
    pin,
    unpin,
    rename,
    reorder,
  };
}

export type QuickFiltersAPI = ReturnType<typeof useQuickFilters>;
