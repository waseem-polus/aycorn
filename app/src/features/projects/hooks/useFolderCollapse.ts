import { useLocalStorage } from "@/features/calendar/hooks";

const STORAGE_KEY = "aycorn.projects.collapsedFolders";

// Tracks which project folders are collapsed, persisted across sessions.
// Bulk ops (collapse all / expand non-empty / etc.) merge into the existing
// set rather than replacing it wholesale, so collapsing folders visible under
// one tab or search term doesn't clobber the state of folders hidden by it.
export function useFolderCollapse() {
  const [collapsedIds, setCollapsedIds] = useLocalStorage<number[]>(
    STORAGE_KEY,
    [],
  );

  const isCollapsed = (id: number) => collapsedIds.includes(id);

  const toggle = (id: number) =>
    setCollapsedIds((prev: number[]) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const collapseIds = (ids: number[]) =>
    setCollapsedIds((prev: number[]) =>
      Array.from(new Set([...prev, ...ids])),
    );

  const expandIds = (ids: number[]) =>
    setCollapsedIds((prev: number[]) => prev.filter((id) => !ids.includes(id)));

  return { isCollapsed, toggle, collapseIds, expandIds };
}
