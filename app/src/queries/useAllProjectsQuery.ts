import { useQuery } from "@tanstack/react-query";
import type { Project } from "@/types/types";

// `archived` splits the projects page's Open/Archived views. Leave it undefined
// to get both — that's what surfaces outside the projects page want, since
// archiving only hides a project from that page.
export function useAllProjectsQuery(archived?: boolean) {
  return useQuery<Project[]>({
    queryKey: ["allProjects", archived ?? "all"],
    queryFn: async () => {
      const query = archived === undefined ? "" : `?archived=${archived}`;
      const res = await fetch(`/api/project${query}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
