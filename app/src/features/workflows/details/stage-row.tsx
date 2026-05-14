import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Stage } from "@/types/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableHeader } from "@/components/EditableHeader";
import { StageIcon } from "@/features/stage/stage-visual";
import { StageColorSquare } from "@/features/workflows/details/stage-color-square";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { StageRowMenu } from "@/features/workflows/details/stage-row-menu";
import { DeleteStageDialog } from "@/features/workflows/details/delete-stage-dialog";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { cn } from "@/lib/utils";

export function StageRow({
  stage,
  workflowId,
}: {
  stage: Stage;
  workflowId: number;
}) {
  const { updateStage } = useStageMutation(workflowId);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.ID });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    if (newName !== stage.Name) {
      updateStage.mutate({ ...stage, Name: newName });
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex-row items-center gap-3 rounded-lg px-3 py-3 shadow-none",
        isDragging && "opacity-50 z-10",
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* TODO: wire up icon picker */}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Change stage icon"
      >
        <StageIcon stage={stage} />
      </Button>

      <div className="flex flex-col min-w-0 flex-1">
        {isEditing ? (
          <EditableHeader
            ref={editableRef}
            value={stage.Name}
            setValue={handleSaveName}
            onBlur={() => setIsEditing(false)}
            placeholder="Untitled stage"
            className="text-sm font-medium p-0 min-h-0"
          />
        ) : (
          <span className="text-sm font-medium truncate">{stage.Name}</span>
        )}
        {stage.Description && (
          <span className="text-xs text-muted-foreground truncate">
            {stage.Description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* TODO: wire up color picker */}
        <StageColorSquare color={stage.Color} />
        <span className="text-sm text-muted-foreground">color</span>
      </div>

      {/* TODO: wire up stage-type dropdown with validation */}
      <StageTypeBadge type={stage.Type} />

      <StageRowMenu
        onRename={() => setIsEditing(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <DeleteStageDialog
        stage={stage}
        workflowId={workflowId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </Card>
  );
}
