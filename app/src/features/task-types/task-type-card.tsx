import { useRef, useState } from "react";
import type React from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import type { TaskTypeGlobal } from "@/types/types";
import { EditableHeader } from "@/components/EditableHeader";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyCheckIcon, FoldersIcon } from "lucide-react";
import { IconColorPicker } from "@/features/icon-picker/icon-color-picker";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { TaskTypeCardMenu } from "@/features/task-types/task-type-card-menu";
import { DeleteTaskTypeDialog } from "@/features/task-types/delete-task-type-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

type Props = {
  type: TaskTypeGlobal;
  children?: React.ReactNode;
  dragRef?: (node: HTMLElement | null) => void;
  dragStyle?: React.CSSProperties;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: DragListeners;
};

export function TaskTypeCard({
  type,
  children,
  dragRef,
  dragStyle,
  dragAttributes,
  dragListeners,
}: Props) {
  const { updateTaskType } = useTaskTypeMutation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLHeadingElement>(null);

  useFocusAndSelect(nameRef, isEditingName);
  useFocusAndSelect(descriptionRef, isEditingDescription);

  const save = (patch: Partial<typeof type>) => {
    updateTaskType.mutate(
      { ...type, ...patch },
      { onError: () => toast.error("Failed to update type.") },
    );
  };

  const handleSaveName = (newName: string) => {
    setIsEditingName(false);
    if (newName !== type.Name) save({ Name: newName });
  };

  const handleSaveDescription = (newDescription: string) => {
    setIsEditingDescription(false);
    if (newDescription !== type.Description)
      save({ Description: newDescription });
  };

  const projectLabel =
    type.ProjectCount === 0
      ? "0 projects"
      : type.ProjectCount === 1
        ? "1 project"
        : `${type.ProjectCount} projects`;

  const taskLabel = type.TaskCount === 1 ? "1 task" : `${type.TaskCount} tasks`;

  return (
    <>
      <div
        ref={dragRef}
        style={dragStyle}
        {...dragAttributes}
        {...dragListeners}
        data-task-card=""
        className={cn("h-full", dragListeners && "cursor-grab")}
      >
        <Card className="relative gap-3 rounded-lg py-4 shadow-none h-full">
          <CardHeader className="relative gap-0.5 px-4 pointer-events-none">
            <CardTitle className="font-medium min-w-0 flex items-center gap-2">
              <div className="pointer-events-auto flex items-center gap-1 shrink-0">
                <IconColorPicker
                  iconValue={type.Icon}
                  colorValue={type.Color}
                  onIconSelect={(icon) => save({ Icon: icon })}
                  onColorSelect={(color) => save({ Color: color })}
                  iconClassName={stageStrokeClass(type.Color)}
                />
              </div>
              <div
                className="pointer-events-auto flex-1 min-w-0"
                onKeyDown={(e) => e.stopPropagation()}
              >
                <EditableHeader
                  ref={nameRef}
                  value={type.Name}
                  setValue={handleSaveName}
                  onBlur={() => setIsEditingName(false)}
                  placeholder="Untitled Type"
                  className="text-base font-medium p-0 min-h-0 cursor-text"
                />
              </div>
            </CardTitle>

            <div
              className="pointer-events-auto"
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EditableHeader
                ref={descriptionRef}
                value={type.Description}
                setValue={handleSaveDescription}
                onBlur={() => setIsEditingDescription(false)}
                placeholder="Click to add a description..."
                className="text-xs font-normal text-muted-foreground p-0 min-h-0 cursor-text"
              />
            </div>

            <CardAction className="pointer-events-auto flex items-start gap-0.5">
              <TaskTypeCardMenu
                isDefault={type.IsDefault}
                onRename={() => setTimeout(() => setIsEditingName(true), 100)}
                onEditDescription={() =>
                  setTimeout(() => setIsEditingDescription(true), 100)
                }
                onDelete={() => setDeleteOpen(true)}
              />
              {children}
            </CardAction>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center gap-1.5 px-4 pointer-events-none">
            <Badge variant="outline" className="text-xs">
              <FoldersIcon className="size-3" />
              {projectLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CopyCheckIcon className="size-3" />
              {taskLabel}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <DeleteTaskTypeDialog
        type={type}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
