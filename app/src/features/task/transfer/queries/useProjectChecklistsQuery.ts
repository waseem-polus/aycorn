import { useQuery } from "@tanstack/react-query";
import type { ChecklistDetails } from "@/types/types";

/**
 * The checklists of an arbitrary project. Every task belongs to a checklist and
 * checklists are project-scoped, so a move/copy has to load the destination's
 * before it can offer one — without navigating to that project.
 */
export function useProjectChecklistsQuery(
  projectId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery<ChecklistDetails[]>({
    queryKey: ["projectChecklists", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/checklist/${projectId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: enabled && projectId !== 0,
  });
}
