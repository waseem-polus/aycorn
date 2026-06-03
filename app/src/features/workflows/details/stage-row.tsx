import { useRef, useState, type CSSProperties } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { Stage } from "@/types/types";
import { Card } from "@/components/ui/card";
import { EditableHeader } from "@/components/EditableHeader";
import { IconColorPicker } from "@/features/icon-picker/icon-color-picker";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { StageTypeSelect } from "@/features/workflows/details/stage-type-select";
import { StageRowMenu } from "@/features/workflows/details/stage-row-menu";
import { DeleteStagesDialog } from "@/features/workflows/details/delete-stages-dialog";
import { useStageMutation } from "@/features/workflows/shared/queries/useStageMutation";
import { selectedItemClasses, useSharedSelection } from "@/hooks/useSelection";
import { cn } from "@/lib/utils";

export function StageRow({
  stage,
  stages,
  workflowId,
}: {
  stage: Stage;
  stages: Stage[];
  workflowId: number;
}) {
  const { updateStage } = useStageMutation(workflowId);
  const { getItemProps } = useSharedSelection();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLHeadingElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.ID });

  const itemProps = getItemProps(String(stage.ID));
  const itemOnClick = (itemProps as { onClick?: (e: React.MouseEvent) => void })
    .onClick;
  const itemClassName = (itemProps.className as string | undefined) ?? "";
  const itemSelected = (itemProps as { "data-selected"?: "" | undefined })[
    "data-selected"
  ];

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useFocusAndSelect(nameRef, isEditingName);
  useFocusAndSelect(descriptionRef, isEditingDescription);

  const saveStage = (patch: Partial<Stage>) =>
    updateStage.mutate(
      { ...stage, ...patch },
      { onError: (err) => toast(err.message || "Failed to update stage.") },
    );

  const handleSaveName = (newName: string) => {
    setIsEditingName(false);
    if (newName !== stage.Name) {
      saveStage({ Name: newName });
    }
  };

  const handleSaveDescription = (newDescription: string) => {
    setIsEditingDescription(false);
    if (newDescription !== stage.Description) {
      saveStage({ Description: newDescription });
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-id={String(stage.ID)}
      data-selected={itemSelected}
      data-task-card=""
      onClick={itemOnClick}
      className={cn(
        "relative flex-row items-center gap-3 rounded-lg px-3 py-3 shadow-none selectable",
        selectedItemClasses(),
        isDragging && "opacity-50 z-10",
        itemClassName,
      )}
    >
      <button
        type="button"
        data-drag-handle=""
        aria-label="Drag to reorder"
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5 lg:size-4" />
      </button>

      <IconColorPicker
        iconValue={stage.Icon}
        colorValue={stage.Color}
        iconClassName={cn(stageStrokeClass(stage.Color), "size-5 lg:size-4")}
        onIconSelect={(name) => name !== stage.Icon && saveStage({ Icon: name })}
        onColorSelect={(color) => color !== stage.Color && saveStage({ Color: color })}
      />

      <div className="flex flex-col min-w-0 flex-1">
        <EditableHeader
          ref={nameRef}
          value={stage.Name}
          setValue={handleSaveName}
          onBlur={() => setIsEditingName(false)}
          placeholder="Untitled Stage"
          className="text-sm font-medium p-0 min-h-0"
        />
        <EditableHeader
          ref={descriptionRef}
          value={stage.Description}
          setValue={handleSaveDescription}
          onBlur={() => setIsEditingDescription(false)}
          placeholder="Add stage description..."
          className="text-xs font-normal text-muted-foreground p-0 min-h-0"
        />
      </div>

      <div className="shrink-0 w-fit sm:w-20">
        <StageTypeSelect stage={stage} workflowId={workflowId} />
      </div>

      <StageRowMenu
        isTheOpenStage={stage.Type === "open"}
        onRename={() => setIsEditingName(true)}
        onEditDescription={() => setIsEditingDescription(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <DeleteStagesDialog
        stages={stages}
        stagesToDelete={[stage]}
        workflowId={workflowId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </Card>
  );
}
