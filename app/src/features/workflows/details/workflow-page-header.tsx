import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
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
  const editableRef = useRef<HTMLHeadingElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const hasAutoFocused = useRef(false);

  useEffect(() => {
    if (autoFocusName && !hasAutoFocused.current && editableRef.current) {
      hasAutoFocused.current = true;
      editableRef.current.focus();
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
        ID: workflow.ID,
        Name: newName,
        Description: workflow.Description,
        TimeCreated: workflow.TimeCreated,
        TimeModified: workflow.TimeModified,
      });
    }
  };

  const handleSaveDescription = (newDescription: string) => {
    if (newDescription !== workflow.Description) {
      updateWorkflow.mutate({
        ID: workflow.ID,
        Name: workflow.Name,
        Description: newDescription,
        TimeCreated: workflow.TimeCreated,
        TimeModified: workflow.TimeModified,
      });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <EditableHeader
          ref={editableRef}
          value={workflow.Name}
          setValue={handleSaveName}
          placeholder="Untitled workflow"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => editableRef.current?.focus()}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditableHeader
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
