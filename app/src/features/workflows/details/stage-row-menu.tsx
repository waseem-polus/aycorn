import {
  MoreHorizontal,
  RectangleEllipsisIcon,
  TextCursorInputIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StageRowMenuProps = {
  isTheOpenStage: boolean;
  onRename: () => void;
  onEditDescription: () => void;
  onDelete: () => void;
};

export function StageRowMenu({
  isTheOpenStage,
  onRename,
  onEditDescription,
  onDelete,
}: StageRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={onRename}>
          <TextCursorInputIcon className="text-muted-foreground" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditDescription}>
          <RectangleEllipsisIcon className="text-muted-foreground" />
          Edit description
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isTheOpenStage ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DropdownMenuItem variant="default" disabled>
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent className="inline-flex gap-1">
              <TriangleAlertIcon className="size-3.5 text-amber-500" />
              The open stage can&apos;t be deleted.
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
