import {
  ArchiveIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  PlusIcon,
  WorkflowIcon,
} from "lucide-react";
import type { PaletteCommand } from "@/features/command-palette/command-types";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";
import { useCreateProject } from "@/features/projects/hooks/useCreateProject";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useCreateWorkflow } from "@/features/workflows/shared/hooks/useCreateWorkflow";

/**
 * Command palette commands for the projects list (`/`). Mirrors the page's
 * toolbar and folder menus; folder bulk toggles act on the same id lists.
 */
export const useProjectsPageCommands = ({
  archivedView,
  onShowArchived,
  onCreateFolder,
  visibleFolderIds,
  emptyFolderIds,
  nonEmptyFolderIds,
  collapseFolders,
  expandFolders,
}: {
  archivedView: boolean;
  onShowArchived: (archived: boolean) => void;
  onCreateFolder: () => void;
  visibleFolderIds: number[];
  emptyFolderIds: number[];
  nonEmptyFolderIds: number[];
  collapseFolders: (ids: number[]) => void;
  expandFolders: (ids: number[]) => void;
}) => {
  const { data: workflows = [] } = useAllWorkflowsQuery();
  const { create: createProject } = useCreateProject({ navigateOnCreate: true });
  const { create: createWorkflow } = useCreateWorkflow();

  const createProjectCommand: PaletteCommand = {
    id: "project.create",
    title: "Create project",
    group: "Projects",
    icon: PlusIcon,
    keywords: ["new", "add"],
    // Same rules as the New Project button: one workflow needs no choice, none
    // means creating a workflow first.
    ...(workflows.length === 1
      ? { run: () => createProject(workflows[0].ID) }
      : workflows.length === 0
        ? { hint: "Needs a workflow", run: createWorkflow }
        : {
            placeholder: "Choose the project's workflow…",
            items: workflows.map((workflow) => ({
              id: `project.create.workflow.${workflow.ID}`,
              title: workflow.Name || "Untitled Workflow",
              group: "Workflows",
              icon: WorkflowIcon,
              keywords: workflow.Description ? [workflow.Description] : [],
              run: () => createProject(workflow.ID),
            })),
          }),
  };

  const folderToggles: PaletteCommand[] = [
    {
      id: "projects.folders.collapseAll",
      title: "Collapse all folders",
      group: "Folders",
      icon: ChevronsDownUpIcon,
      run: () => collapseFolders(visibleFolderIds),
    },
    {
      id: "projects.folders.expandAll",
      title: "Expand all folders",
      group: "Folders",
      icon: ChevronsUpDownIcon,
      run: () => expandFolders(visibleFolderIds),
    },
    // The archived tab hides empty folders, so these only apply to open projects.
    ...(archivedView
      ? []
      : [
          {
            id: "projects.folders.collapseEmpty",
            title: "Collapse empty folders",
            group: "Folders",
            icon: ChevronsDownUpIcon,
            run: () => collapseFolders(emptyFolderIds),
          },
          {
            id: "projects.folders.expandNonEmpty",
            title: "Expand non-empty folders",
            group: "Folders",
            icon: ChevronsUpDownIcon,
            run: () => expandFolders(nonEmptyFolderIds),
          },
        ]),
  ];

  useRegisterCommands([
    createProjectCommand,
    {
      id: "projects.folder.create",
      title: "Create folder",
      group: "Folders",
      icon: FolderPlusIcon,
      keywords: ["new", "add"],
      run: onCreateFolder,
    },
    ...folderToggles,
    {
      // One id for both directions so it stays a single recents entry.
      id: "projects.archived.toggle",
      title: archivedView ? "Show open projects" : "Show archived projects",
      group: "Projects",
      icon: archivedView ? FolderOpenIcon : ArchiveIcon,
      keywords: ["archive", "archived", "open", "toggle"],
      run: () => onShowArchived(!archivedView),
    },
  ]);
};
