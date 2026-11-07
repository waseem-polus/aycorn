import { useLocalStorage } from "@/features/calendar/hooks";

/** Which groups of a grouped view are collapsed, remembered under `storageKey`. */
export function useCollapsedGroups(storageKey: string) {
  const [collapsedKeys, setCollapsedKeys] = useLocalStorage<string[]>(storageKey, []);

  const toggleCollapsed = (key: string) =>
    setCollapsedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  return {
    collapsedKeys,
    isCollapsed: (key: string) => collapsedKeys.includes(key),
    toggleCollapsed,
  };
}
