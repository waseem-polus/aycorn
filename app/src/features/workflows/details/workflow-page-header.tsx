import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  MoreHorizontal,
  RectangleEllipsisIcon,
  TextCursorInputIcon,
  Trash2Icon,
} from "lucide-react";
import { EditableHeader } from "@/components/EditableHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteWorkflowDialog } from "@/features/workflows/list/delete-workflow-dialog";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";
import type { WorkflowSummary } from "@/types/types";

export function WorkflowPageHeader({
  workflow,
  autoFocusName = false,
}: {
  workflow: WorkflowSummary;
  autoFocusName?: boolean;
}) {
  const navigate = useNavigate();
  const { updateWorkflow } = useWorkflowMutation(workflow.ID);
  const editableTitleRef = useRef<HTMLHeadingElement>(null);
  const editableDescriptionRef = useRef<HTMLHeadingElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const hasAutoFocused = useRef(false);

  useEffect(() => {
    if (autoFocusName && !hasAutoFocused.current && editableTitleRef.current) {
      hasAutoFocused.current = true;
      editableTitleRef.current.focus();
      navigate({
        to: "/workflow/$workflowId",
        params: { workflowId: String(workflow.ID) },
        search: {},
        replace: true,
      });
    }
  }, [autoFocusName, navigate, workflow.ID]);

  const handleSaveName = (newName: string) => {
    if (newName !== workflow.Name) {
      updateWorkflow.mutate({
        ...workflow,
        Name: newName,
      });
    }
  };

  const handleSaveDescription = (newDescription: string) => {
    if (newDescription !== workflow.Description) {
      updateWorkflow.mutate({
        ...workflow,
        Description: newDescription,
      });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <EditableHeader
          ref={editableTitleRef}
          value={workflow.Name}
          setValue={handleSaveName}
          placeholder="Untitled Workflow"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => editableTitleRef.current?.focus()}>
              <TextCursorInputIcon className="text-muted-foreground" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editableDescriptionRef.current?.focus()}>
              <RectangleEllipsisIcon className="text-muted-foreground" />
              Edit description
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditableHeader
        ref={editableDescriptionRef}
        value={workflow.Description}
        setValue={handleSaveDescription}
        placeholder="Add a description"
        className="text-sm font-normal text-muted-foreground min-h-6"
      />

      <DeleteWorkflowDialog
        workflow={workflow}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate({ to: "/workflows" })}
      />
    </div>
  );
}
