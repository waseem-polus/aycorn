import { ClipboardIcon,
  CopyCheckIcon,
  CopyPlusIcon,
  Ellipsis,
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
import { cn } from "@/lib/utils";

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
 * page so the two can't drift apart.
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
            <DropdownMenuItem onClick={transfer.openCopy}>
              <CopyPlusIcon className="text-muted-foreground" />
              Copy to project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={transfer.openMove}>
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
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2Icon className="text-muted-foreground" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskTransferDialogs transfer={transfer} />
    </>
  );
}
