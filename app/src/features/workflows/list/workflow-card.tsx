import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { WorkflowSummary } from "@/types/types";
import { EditableHeader } from "@/components/EditableHeader";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";
import { WorkflowCardMenu } from "@/features/workflows/list/workflow-card-menu";
import { DeleteWorkflowDialog } from "@/features/workflows/list/delete-workflow-dialog";

export function WorkflowCard({ workflow }: { workflow: WorkflowSummary }) {
  const navigate = useNavigate();
  const { updateWorkflow } = useWorkflowMutation(workflow.ID);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const stageCount = workflow.Stages?.length ?? 0;
  const projectLabel =
    workflow.ProjectCount === 0
      ? "Unused"
      : workflow.ProjectCount === 1
        ? "1 project"
        : `${workflow.ProjectCount} projects`;

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleSaveName = (newName: string) => {
    setIsEditing(false);
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

  return (
    <>
      <Card
        className="relative gap-3 rounded-lg py-4 shadow-none hover:bg-accent/30 cursor-pointer"
        onClick={() => {
          if (!isEditing) {
            navigate({
              to: "/workflow/$workflowId",
              params: { workflowId: String(workflow.ID) },
            });
          }
        }}
      >
        <CardHeader className="relative gap-0.5 px-4 pointer-events-none">
          <CardTitle className="font-medium min-w-0">
            {isEditing ? (
              <div
                className="pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <EditableHeader
                  ref={editableRef}
                  value={workflow.Name}
                  setValue={handleSaveName}
                  onBlur={() => setIsEditing(false)}
                  placeholder="Untitled Workflow"
                  className="text-base font-medium p-0 min-h-0"
                />
              </div>
            ) : workflow.Name === "" ? (
              <span className="text-base truncate text-muted-foreground">
                Untitled Workflow
              </span>
            ) : (
              <span className="text-base truncate">{workflow.Name}</span>
            )}
          </CardTitle>
          {workflow.Description !== "" && (
            <CardDescription className="text-xs truncate">
              {workflow.Description}
            </CardDescription>
          )}
          <CardDescription className="text-xs">
            {stageCount} stages · {projectLabel}
          </CardDescription>
          <CardAction className="pointer-events-auto">
            <WorkflowCardMenu
              onRename={() => setTimeout(() => setIsEditing(true), 100)}
              onDelete={() => setDeleteOpen(true)}
            />
          </CardAction>
        </CardHeader>

        <CardContent className="relative flex flex-wrap gap-1.5 px-4 pointer-events-none">
          {workflow.Stages?.map((stage) => (
            <WorkflowStageChip key={stage.ID} stage={stage} />
          ))}
        </CardContent>
      </Card>

      <DeleteWorkflowDialog
        workflow={workflow}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
