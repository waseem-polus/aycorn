import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";

/** Creates an empty project with the given workflow, optionally opening it. */
export const useCreateProject = ({
  folderId,
  onCreated,
  navigateOnCreate = false,
}: {
  folderId?: number;
  onCreated?: (id: number) => void;
  navigateOnCreate?: boolean;
} = {}) => {
  const navigate = useNavigate();
  const { createProject } = useAllProjectsMutation();

  const create = (workflowId: number) =>
    createProject.mutate(
      { workflowId, folder: folderId },
      {
        onSuccess: (id) => {
          onCreated?.(id);
          if (navigateOnCreate) {
            navigate({
              to: "/project/$projectId",
              params: { projectId: String(id) },
            });
          }
        },
        onError: (err) =>
          toast.error(err.message || "Failed to create project."),
      },
    );

  return { create, isPending: createProject.isPending };
};
