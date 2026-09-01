import type { TaskFacets } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Filter options derived from the tasks themselves — assignees and the
 * checklists that hold tasks. Passing a projectId scopes both to that project
 * so a project-local drawer doesn't offer options that match nothing there.
 */
export function useTaskFacetsQuery(projectId?: number) {
  return useQuery<TaskFacets>({
    queryKey: ["taskFacets", projectId ?? null],
    queryFn: async () => {
      const url = new URL("/api/tasks/facets", window.location.origin);
      if (projectId) url.searchParams.set("project", String(projectId));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
