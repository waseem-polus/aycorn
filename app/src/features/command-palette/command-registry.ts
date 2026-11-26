import type { CommandSource } from "@/features/command-palette/command-types";

export type CommandRegistry = ReturnType<typeof createCommandRegistry>;

/**
 * A small external store (consumed with `useSyncExternalStore`) holding every
 * mounted component's commands, keyed by that component's registration id.
 *
 * It lives outside React state on purpose: components re-register on every
 * change to their commands, and only the open palette subscribes, so those
 * updates never re-render the app tree.
 */
export const createCommandRegistry = () => {
  const sources = new Map<string, CommandSource>();
  const listeners = new Set<() => void>();
  let snapshot: CommandSource[] = [];

  const emit = () => {
    snapshot = [...sources.values()];
    listeners.forEach((listener) => listener());
  };

  return {
    set: (key: string, source: CommandSource) => {
      sources.set(key, source);
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
