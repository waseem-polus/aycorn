import { useState } from "react";

/**
 * A board's search term. Deliberately not persisted: a term left over from a
 * previous session looks like missing data ("only 1-2 tasks") when the page is
 * reopened, so it lives in plain component state and resets on mount.
 */
export function useTaskSearch() {
  const [search, setSearch] = useState("");
  return { search, setSearch };
}
