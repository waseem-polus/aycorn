import { useState } from "react";

const storageKey = (id: number) => `taskType_cat_collapsed_${id}`;

const readCollapsed = (id: number): boolean => {
  try {
    return localStorage.getItem(storageKey(id)) === "true";
  } catch {
    return false;
  }
};

const writeCollapsed = (id: number, collapsed: boolean) => {
  try {
    if (collapsed) localStorage.setItem(storageKey(id), "true");
    else localStorage.removeItem(storageKey(id));
  } catch {
    // Storage unavailable: the state still holds for this session.
  }
};

/**
 * Which task type categories are collapsed, persisted per category. Owned by
 * the page (not each section) so page-level actions, like creating a type
 * from the command palette, can expand the category they add to.
 */
export const useCategoryCollapse = () => {
  // Only categories changed this session; the rest fall back to storage.
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});

  const isCollapsed = (id: number) => overrides[id] ?? readCollapsed(id);

  const setCollapsed = (id: number, collapsed: boolean) => {
    writeCollapsed(id, collapsed);
    setOverrides((prev) => ({ ...prev, [id]: collapsed }));
  };

  return { isCollapsed, setCollapsed };
};
