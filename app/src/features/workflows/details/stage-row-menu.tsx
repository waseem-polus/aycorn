import { MoreHorizontal } from "lucide-react";
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
  isOpen: boolean;
  onRename: () => void;
  onEditDescription: () => void;
  onDelete: () => void;
};

export function StageRowMenu({
  isOpen,
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
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onEditDescription}>
          Edit description
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isOpen ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DropdownMenuItem variant="destructive" disabled>
                  Delete
                </DropdownMenuItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>The open stage can&apos;t be deleted.</TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
