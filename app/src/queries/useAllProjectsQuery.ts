import { useQuery } from "@tanstack/react-query";

export function useAllProjectsQuery() {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ["allProjects"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/project");
      return await res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
