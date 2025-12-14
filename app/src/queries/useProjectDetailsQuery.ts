import { useQuery } from "@tanstack/react-query";

export function useProjectDetailsQuery(projectId: number) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/api/project/${projectId}`);

      return res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
