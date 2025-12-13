import { useQuery } from "@tanstack/react-query";

export function usePinnedProjectsQuery() {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ["pinnedProjects"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/project/pinned");
      return await res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
