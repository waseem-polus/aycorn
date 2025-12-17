import type { TaskFilter } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export function useProjectDetailsQuery(
  projectId: number,
  filter: TaskFilter,
  enabled: boolean,
) {
  const { isPending, error, data, isFetching, refetch } = useQuery({
    queryKey: ["projectDetails", projectId],
    enabled: enabled,
    queryFn: async () => {
      const url = new URL(`http://localhost:8000/api/project/${projectId}`);
      url.searchParams.set("search", filter?.Name ?? "");

      filter?.Checklist?.forEach((checklist) =>
        url.searchParams.append("checklist", checklist.toString()),
      );
      filter.Type.forEach((type) =>
        url.searchParams.append("type", type.toString()),
      );
      filter.Status.forEach((status) =>
        url.searchParams.append("status", status.toString()),
      );
      filter.Priority.forEach((priority) =>
        url.searchParams.append("priority", priority.toString()),
      );
      filter.Assignee.forEach((assignee) =>
        url.searchParams.append("assignee", assignee.toString()),
      );

      const res = await fetch(url.toString());

      return res.json();
    },
  });

  return { isPending, error, data, isFetching, refetch };
}
