import { useState } from "react";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteRelationshipTypeDialog } from "@/features/relationship-types/delete-relationship-type-dialog";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeCardMenu({ type }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Relationship type actions"
          >
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteRelationshipTypeDialog
        type={type}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
