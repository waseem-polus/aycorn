import { useLocalStorage } from "@/features/calendar/hooks";

const STORED_LIMIT = 20;

/** Ids ("task:12") of entities most recently opened from search, newest first. */
export const useRecentEntities = () => {
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(
    "aycorn.commandPalette.recentEntities",
    [],
  );

  const recordRecent = (id: string) =>
    setRecentIds((ids) =>
      [id, ...ids.filter((existing) => existing !== id)].slice(0, STORED_LIMIT),
    );

  return { recentIds, recordRecent };
};
