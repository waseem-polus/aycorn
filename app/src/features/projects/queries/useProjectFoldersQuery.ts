import type { ProjectFolder } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useProjectFoldersQuery() {
  return useQuery<ProjectFolder[]>({
    queryKey: ["projectFolders"],
    queryFn: async () => {
      const res = await fetch("/api/project-folder");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}
