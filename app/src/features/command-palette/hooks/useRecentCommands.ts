import { useLocalStorage } from "@/features/calendar/hooks";

/**
 * Kept longer than the list shown, because a recent command may belong to a
 * page that isn't mounted right now.
 */
const STORED_LIMIT = 20;

/** Most recently run command ids, newest first. */
export const useRecentCommands = () => {
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(
    "aycorn.commandPalette.recent",
    [],
  );

  const recordRecent = (id: string) =>
    setRecentIds((ids) =>
      [id, ...ids.filter((existing) => existing !== id)].slice(0, STORED_LIMIT),
    );

  return { recentIds, recordRecent };
};
