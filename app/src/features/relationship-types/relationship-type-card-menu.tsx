import { MoreHorizontal, TextCursorInputIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  onRenameFrom: () => void;
  onRenameTo: () => void;
  onDelete: () => void;
};

export function RelationshipTypeCardMenu({
  onRenameFrom,
  onRenameTo,
  onDelete,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
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
        <DropdownMenuItem onClick={onRenameFrom}>
          <TextCursorInputIcon className="text-muted-foreground" />
          Rename "from" label
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRenameTo}>
          <TextCursorInputIcon className="text-muted-foreground" />
          Rename "to" label
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
