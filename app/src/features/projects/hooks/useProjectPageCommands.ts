import { useContext } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  FolderIcon,
  FolderInputIcon,
  PaletteIcon,
  PinIcon,
  PinOffIcon,
  RefreshCwIcon,
  SettingsIcon,
  TextCursorInputIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";
import { folderName } from "@/features/projects/folder-name";
import { useProjectFoldersQuery } from "@/features/projects/queries/useProjectFoldersQuery";
import { useSwitchWorkflow } from "@/features/settings/project-workflow/hooks/useSwitchWorkflow";
import { useProjectWorkflowSettingsQuery } from "@/features/settings/project-workflow/queries/useProjectWorkflowSettingsQuery";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { useProjectMutation } from "@/queries/useProjectMutation";

/**
 * Command palette commands for a project page, mirroring its header menu and
 * the project card's menu. UI-only actions (rename, icon, delete confirm) are
 * callbacks into the header that owns them.
 *
 * Returns the workflow switch state: switching a project that has tasks needs
 * the stage-mapping dialog, which the caller renders.
 */
export const useProjectPageCommands = ({
  onRename,
  onChangeIcon,
  onDelete,
}: {
  onRename: () => void;
  onChangeIcon: () => void;
  onDelete: () => void;
}) => {
  const navigate = useNavigate();
  const { Project } = useContext(ProjectContext);
  const { setPinned, setArchived } = useProjectMutation(Project.ID);
  const { bulkSetFolder } = useAllProjectsMutation();
  const { data: folders = [] } = useProjectFoldersQuery();
  const { data: workflows = [] } = useAllWorkflowsQuery();
  // This project's stages with their task counts, for the stage-mapping dialog.
  // Project.ID is 0 until the project page has loaded the project.
  const { data: workflowSettings } = useProjectWorkflowSettingsQuery(
    Project.ID,
    { enabled: Project.ID !== 0 },
  );
  const currentStages = workflowSettings?.Stages ?? [];
  const switchWorkflow = useSwitchWorkflow({
    projectId: Project.ID,
    currentWorkflowId: Project.Workflow,
    currentStages,
  });

  const projectName = Project.Name || "Untitled Project";

  useRegisterCommands([
    {
      id: "project.rename",
      title: "Rename project",
      group: "Project",
      icon: TextCursorInputIcon,
      keywords: ["name", "title", "edit"],
      run: onRename,
    },
    {
      id: "project.icon.change",
      title: "Change project icon",
      group: "Project",
      icon: PaletteIcon,
      keywords: ["color", "emoji"],
      run: onChangeIcon,
    },
    {
      // One id for both directions so it stays a single recents entry.
      id: "project.pin.toggle",
      title: Project.Pinned ? "Unpin project" : "Pin project",
      group: "Project",
      icon: Project.Pinned ? PinOffIcon : PinIcon,
      keywords: ["sidebar"],
      run: () =>
        setPinned.mutate(!Project.Pinned, {
          onError: () => toast.error("Failed to update pin."),
        }),
    },
    {
      id: "project.folder.move",
      title: "Move project to folder",
      group: "Project",
      icon: FolderInputIcon,
      placeholder: "Choose a folder…",
      items: folders
        .filter((folder) => folder.ID !== Project.Folder)
        .map((folder) => ({
          id: `project.folder.move.${folder.ID}`,
          title: folderName(folder),
          group: "Folders",
          icon: FolderIcon,
          run: () =>
            bulkSetFolder.mutate(
              { ids: [Project.ID], folder: folder.ID },
              {
                onSuccess: () =>
                  toast(`Moved "${projectName}" to ${folderName(folder)}.`),
                onError: () => toast.error("Failed to move project."),
              },
            ),
        })),
    },
    {
      id: "project.archive.toggle",
      title: Project.Archived ? "Unarchive project" : "Archive project",
      group: "Project",
      icon: Project.Archived ? ArchiveRestoreIcon : ArchiveIcon,
      keywords: ["restore"],
      run: () =>
        setArchived.mutate(!Project.Archived, {
          onSuccess: () =>
            toast(
              Project.Archived
                ? `Restored "${projectName}".`
                : `Archived "${projectName}".`,
            ),
          onError: () => toast.error("Failed to update project."),
        }),
    },
    {
      id: "project.delete",
      title: "Delete project",
      group: "Project",
      icon: Trash2Icon,
      keywords: ["remove"],
      run: onDelete,
    },
    {
      id: "project.workflow.open",
      title: "Go to project workflow",
      group: "Project",
      icon: WorkflowIcon,
      hint: Project.WorkflowName || undefined,
      keywords: ["navigate", "stages"],
      run: () =>
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(Project.Workflow) },
        }),
    },
    {
      id: "project.workflow.switch",
      title: "Switch project workflow",
      group: "Project",
      icon: RefreshCwIcon,
      keywords: ["change"],
      placeholder: "Choose the new workflow…",
      items: workflows
        .filter((workflow) => workflow.ID !== Project.Workflow)
        .map((workflow) => ({
          id: `project.workflow.switch.${workflow.ID}`,
          title: workflow.Name || "Untitled Workflow",
          group: "Workflows",
          icon: WorkflowIcon,
          keywords: workflow.Description ? [workflow.Description] : [],
          run: () => switchWorkflow.selectWorkflow(workflow),
        })),
    },
    {
      id: "project.settings.open",
      title: "Open project settings",
      group: "Project",
      icon: SettingsIcon,
      run: () =>
        navigate({
          to: "/project/settings/$projectId",
          params: { projectId: String(Project.ID) },
          search: { tab: "workflow" },
        }),
    },
  ]);

  return {
    switchTarget: switchWorkflow.target,
    closeSwitchDialog: switchWorkflow.closeDialog,
    currentWorkflowName: workflowSettings?.Workflow?.Name ?? Project.WorkflowName,
    currentStages,
  };
};
