import { useState } from "react";
import { LockIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteRelationshipTypeDialog } from "@/features/relationship-types/delete-relationship-type-dialog";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeRowActions({ type }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (type.IsSystem) {
    return (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex size-7 items-center justify-center text-muted-foreground">
              <LockIcon className="size-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
          System relationship types cannot be edited or deleted
        </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete relationship type"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2Icon className="text-muted-foreground" />
      </Button>

      <DeleteRelationshipTypeDialog
        type={type}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
