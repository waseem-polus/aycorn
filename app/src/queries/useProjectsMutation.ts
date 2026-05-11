import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";

export function useProjectsMutation() {
  const createProject = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:8000/api/project`, {
        method: "POST",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allProjects"],
      });
    },
  });

  return { createProject };
}
