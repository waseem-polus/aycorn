import { CopyCheckIcon, CopyPlusIcon, FolderInputIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskTransferDialogs } from "@/features/task/transfer/task-transfer-dialogs";
import { useTaskTransfer } from "@/features/task/transfer/use-task-transfer";
import type { TransferTask } from "@/features/task/transfer/transfer-tasks-dialog";

type Props = {
  tasks: TransferTask[];
  // Omit for a selection that spans projects (/upcoming) — there is no single
  // project to keep out of the destination list.
  excludeProjectId?: number | null;
  onDone?: () => void;
  disabled?: boolean;
};

/**
 * The bulk-toolbar entry point for moving, copying and duplicating a selection.
 * One button rather than three so the toolbar doesn't wrap.
 */
export function MoveCopyMenu({
  tasks,
  excludeProjectId,
  onDone,
  disabled,
}: Props) {
  const transfer = useTaskTransfer({
    tasks,
    excludeProjectId,
    onMoved: onDone,
    onCopied: onDone,
  });

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Move or copy"
                disabled={disabled || transfer.busy}
              >
                <FolderInputIcon />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Move or copy</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
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
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskTransferDialogs transfer={transfer} />
    </>
  );
}
