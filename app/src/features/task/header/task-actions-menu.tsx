import { useState } from "react";
import {
  ClipboardIcon,
  CopyCheckIcon,
  CopyPlusIcon,
  Ellipsis,
  FileTextIcon,
  FolderInputIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskTransferDialogs } from "@/features/task/transfer/task-transfer-dialogs";
import { useTaskTransfer } from "@/features/task/transfer/use-task-transfer";
import type { TransferTask } from "@/features/task/transfer/transfer-tasks-dialog";
import { DeleteTaskDialog } from "@/features/task/header/task-actions-menu/delete-task-dialog";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";
import type { PaletteCommand } from "@/features/command-palette/command-types";
import { ProjectIcon } from "@/features/projects/project-icon";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import type { Project } from "@/types/types";
import { cn } from "@/lib/utils";

// One nested-page entry per destination project, for "Move/Copy to project".
const projectItems = (
  projects: Project[],
  idPrefix: string,
  open: (projectId: number) => void,
): PaletteCommand[] =>
  projects.map((project) => ({
    id: `${idPrefix}.${project.ID}`,
    title: project.Name || "Untitled Project",
    group: "Projects",
    icon: <ProjectIcon project={project} />,
    run: () => open(project.ID),
  }));

type Props = {
  task: TransferTask;
  projectId: number;
  onDelete: () => void;
  onCopyAsMarkdown?: () => void;
  onCopyAsPlainText?: () => void;
  isEditorReady?: boolean;
  // A moved task leaves the project the surface is showing, so the drawer that
  // opened it has to close.
  onMoved?: () => void;
  triggerClassName?: string;
  contentClassName?: string;
};

/**
 * The per-task overflow menu, shared by the task drawer header and the task
 * page so the two can't drift apart. It also registers the same actions as
 * command palette commands. Delete goes through a confirm dialog either way.
 */
export function TaskActionsMenu({
  task,
  projectId,
  onDelete,
  onCopyAsMarkdown,
  onCopyAsPlainText,
  isEditorReady = false,
  onMoved,
  triggerClassName,
  contentClassName,
}: Props) {
  const transfer = useTaskTransfer({
    tasks: [task],
    excludeProjectId: projectId,
    onMoved,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Archived projects are left out, as in the transfer dialog's picker.
  const { data: projects = [] } = useAllProjectsQuery(false);
  const destinations = projects.filter((p) => p.ID !== projectId);

  useRegisterCommands([
    {
      id: "task.duplicate",
      title: "Duplicate task",
      group: "Task",
      icon: CopyCheckIcon,
      keywords: ["copy", "clone"],
      run: transfer.duplicate,
    },
    {
      id: "task.move",
      title: "Move task to project",
      group: "Task",
      icon: FolderInputIcon,
      keywords: ["transfer"],
      placeholder: "Choose a project…",
      items: projectItems(destinations, "task.move", transfer.openMove),
    },
    {
      id: "task.copy",
      title: "Copy task to project",
      group: "Task",
      icon: CopyPlusIcon,
      keywords: ["transfer", "duplicate"],
      placeholder: "Choose a project…",
      items: projectItems(destinations, "task.copy", transfer.openCopy),
    },
    ...(onCopyAsMarkdown && isEditorReady
      ? [
          {
            id: "task.copyMarkdown",
            title: "Copy task as markdown",
            group: "Task",
            icon: ClipboardIcon,
            keywords: ["clipboard", "body", "md"],
            run: onCopyAsMarkdown,
          },
        ]
      : []),
    ...(onCopyAsPlainText
      ? [
          {
            id: "task.copyPlainText",
            title: "Copy task as plain text",
            group: "Task",
            icon: FileTextIcon,
            keywords: ["clipboard", "body", "text"],
            run: onCopyAsPlainText,
          },
        ]
      : []),
    {
      id: "task.delete",
      title: "Delete task",
      group: "Task",
      icon: Trash2Icon,
      keywords: ["remove"],
      run: () => setDeleteOpen(true),
    },
  ]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "data-[state=open]:bg-muted text-muted-foreground",
              triggerClassName,
            )}
          >
            <Ellipsis className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("min-w-48", contentClassName)}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={transfer.duplicate}>
              <CopyCheckIcon className="text-muted-foreground" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => transfer.openCopy()}>
              <CopyPlusIcon className="text-muted-foreground" />
              Copy to project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => transfer.openMove()}>
              <FolderInputIcon className="text-muted-foreground" />
              Move to project
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ClipboardIcon className="text-muted-foreground" />
                Copy as
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  disabled={!isEditorReady}
                  onClick={onCopyAsMarkdown}
                >
                  Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopyAsPlainText}>
                  Plain text
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
            >
              <Trash2Icon className="text-muted-foreground" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskTransferDialogs transfer={transfer} />
      <DeleteTaskDialog
        taskName={task.Name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
      />
    </>
  );
}
