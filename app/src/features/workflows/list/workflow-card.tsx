import { useRef, useState } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
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
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

export function WorkflowCard({ workflow }: { workflow: WorkflowSummary }) {
  const navigate = useNavigate();
  const { updateWorkflow } = useWorkflowMutation(workflow.ID);
  const { getItemProps } = useSharedSelection();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLHeadingElement>(null);

  const itemProps = getItemProps(String(workflow.ID));
  const itemOnClick = (
    itemProps as { onClick?: (e: React.MouseEvent) => void }
  ).onClick;
  const itemClassName = (itemProps.className as string | undefined) ?? "";

  const stageCount = workflow.Stages?.length ?? 0;
  const projectLabel =
    workflow.ProjectCount === 0
      ? "Unused"
      : workflow.ProjectCount === 1
        ? "1 project"
        : `${workflow.ProjectCount} projects`;

  useFocusAndSelect(editableRef, isEditing);
  useFocusAndSelect(descriptionRef, isEditingDescription);

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

  const handleSaveDescription = (newDescription: string) => {
    setIsEditingDescription(false);
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
    <>
      <Card
        {...itemProps}
        data-task-card=""
        className={cn(
          "relative gap-3 rounded-lg py-4 shadow-none hover:bg-accent/30 cursor-pointer",
          selectedItemClasses(),
          itemClassName,
        )}
        onClick={(e) => {
          itemOnClick?.(e);
          if (e.defaultPrevented) return;
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
          {isEditingDescription ? (
            <div
              className="pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EditableHeader
                ref={descriptionRef}
                value={workflow.Description}
                setValue={handleSaveDescription}
                onBlur={() => setIsEditingDescription(false)}
                placeholder="Add description..."
                className="text-xs font-normal text-muted-foreground p-0 min-h-0"
              />
            </div>
          ) : (
            workflow.Description !== "" && (
              <CardDescription className="text-xs truncate">
                {workflow.Description}
              </CardDescription>
            )
          )}
          <CardDescription className="text-xs">
            {stageCount} stages · {projectLabel}
          </CardDescription>
          <CardAction className="pointer-events-auto">
            <WorkflowCardMenu
              onRename={() => setTimeout(() => setIsEditing(true), 100)}
              onEditDescription={() =>
                setTimeout(() => setIsEditingDescription(true), 100)
              }
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
