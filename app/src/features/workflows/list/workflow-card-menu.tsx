import {
  MoreHorizontal,
  RectangleEllipsisIcon,
  TextCursorInputIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WorkflowCardMenuProps = {
  onRename: () => void;
  onEditDescription: () => void;
  onDelete: () => void;
};

export function WorkflowCardMenu({
  onRename,
  onEditDescription,
  onDelete,
}: WorkflowCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -mr-1 -mt-1"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
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
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
