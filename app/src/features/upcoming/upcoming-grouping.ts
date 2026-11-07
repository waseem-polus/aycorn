import type { TaskWithProject } from "@/types/types";

/** /upcoming filters search client-side, for instant feedback while typing. */
export function applyClientFilters(
  tasks: TaskWithProject[],
  search: string,
): TaskWithProject[] {
  if (!search.trim()) return tasks;
  const q = search.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      t.Name.toLowerCase().includes(q) || t.Assignee.toLowerCase().includes(q),
  );
}
