import type { CommandSource } from "@/features/command-palette/command-types";

export type CommandRegistry = ReturnType<typeof createCommandRegistry>;

/**
 * A small external store (consumed with `useSyncExternalStore`) holding every
 * mounted component's commands, keyed by that component's registration id.
 *
 * It lives outside React state on purpose: components re-register on every
 * change to their commands, and only the open palette subscribes, so those
 * updates never re-render the app tree.
 *
 * Sources are listed in component-tree order: each registering component
 * takes a ticket when it first renders (parents render before children),
 * whereas effects (where registration happens) run children first.
 */
export const createCommandRegistry = () => {
  const sources = new Map<string, { order: number; source: CommandSource }>();
  const listeners = new Set<() => void>();
  let snapshot: CommandSource[] = [];
  let nextOrder = 0;

  const emit = () => {
    snapshot = [...sources.values()]
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.source);
    listeners.forEach((listener) => listener());
  };

  return {
    /** A position for a registering component, taken on its first render. */
    takeOrder: () => nextOrder++,
    set: (key: string, order: number, source: CommandSource) => {
      sources.set(key, { order, source });
      emit();
    },
    remove: (key: string) => {
      if (sources.delete(key)) emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
};
