import { useRef, useState } from "react";
import { ArrowRightLeftIcon, LockIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableHeader } from "@/components/EditableHeader";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { DeleteRelationshipTypeDialog } from "@/features/relationship-types/delete-relationship-type-dialog";
import { RelationshipTypeCardMenu } from "@/features/relationship-types/relationship-type-card-menu";
import { ExampleRow } from "@/features/relationship-types/relationship-type-card/example-row";
import type { RelationshipBehavior, TaskRelationshipType } from "@/types/types";
import { IconPicker } from "../icon-picker/icon-picker";

const BEHAVIOR_COLOR: Record<RelationshipBehavior, string> = {
  blocking: "red",
  subtask: "emerald",
  link: "purple",
};

const BEHAVIOR_LABEL: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};

type Props = {
  type: TaskRelationshipType;
};

export function RelationshipTypeCard({ type }: Props) {
  const {
    updateRelationshipTypeIcon,
    updateRelationshipTypeNames,
    updateRelationshipType,
  } = useRelationshipTypeMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditingFromName, setIsEditingFromName] = useState(false);
  const [isEditingToName, setIsEditingToName] = useState(false);
  const fromNameRef = useRef<HTMLHeadingElement>(null);
  const toNameRef = useRef<HTMLHeadingElement>(null);

  useFocusAndSelect(fromNameRef, isEditingFromName);
  useFocusAndSelect(toNameRef, isEditingToName);

  const color = BEHAVIOR_COLOR[type.Behavior] ?? "gray";
  const usageLabel =
    (type.UsageCount ?? 0) === 1
      ? "1 relationship"
      : `${type.UsageCount ?? 0} relationships`;

  const handleIconSelect = (icon: string) => {
    updateRelationshipTypeIcon.mutate(
      { id: type.ID, icon },
      { onError: () => toast.error("Failed to update icon.") },
    );
  };

  const handleFromNameSave = (fromName: string) => {
    setIsEditingFromName(false);
    if (fromName !== type.FromName) {
      updateRelationshipTypeNames.mutate(
        { id: type.ID, fromName, toName: type.ToName },
        { onError: () => toast.error("Failed to update name.") },
      );
    }
  };

  const handleToNameSave = (toName: string) => {
    setIsEditingToName(false);
    if (toName !== type.ToName) {
      updateRelationshipTypeNames.mutate(
        { id: type.ID, fromName: type.FromName, toName },
        { onError: () => toast.error("Failed to update name.") },
      );
    }
  };

  const handleBehaviorChange = (behavior: string) => {
    if (type.IsSystem) return;
    updateRelationshipType.mutate(
      {
        ID: type.ID,
        FromName: type.FromName,
        ToName: type.ToName,
        Behavior: behavior as RelationshipBehavior,
        Icon: type.Icon,
      },
      { onError: () => toast.error("Failed to update behavior.") },
    );
  };

  return (
    <>
      <Card className="gap-3 rounded-lg py-4 shadow-none h-full">
        <CardHeader className="gap-1 px-4">
          <CardTitle className="font-medium flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center">
              {type.IsSystem ? (
                <DynamicIcon
                  name={(type.Icon || "link") as IconName}
                  className={cn("size-4", stageStrokeClass(color))}
                  fallback={() => <span className="size-4" />}
                />
              ) : (
                <IconPicker
                  value={type.Icon}
                  onSelect={handleIconSelect}
                  iconClassName={stageStrokeClass(color)}
                />
              )}
            </div>
            {type.IsSystem ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-2">
                    <span className="truncate">{type.FromName}</span>
                    <ArrowRightLeftIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{type.ToName}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  System relationship types cannot be edited or deleted
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                className="flex flex-1 flex-wrap items-center gap-2 min-w-0"
                onKeyDown={(e) => e.stopPropagation()}
              >
                <EditableHeader
                  ref={fromNameRef}
                  value={type.FromName}
                  setValue={handleFromNameSave}
                  onBlur={() => setIsEditingFromName(false)}
                  placeholder="From…"
                  className="text-base font-medium p-0 min-h-0 cursor-text min-w-12"
                />
                <ArrowRightLeftIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <EditableHeader
                  ref={toNameRef}
                  value={type.ToName}
                  setValue={handleToNameSave}
                  onBlur={() => setIsEditingToName(false)}
                  placeholder="To…"
                  className="text-base font-medium p-0 min-h-0 cursor-text min-w-12"
                />
              </div>
            )}
          </CardTitle>

          <CardAction className="flex items-center gap-0.5">
            {type.IsSystem ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex size-7 items-center justify-center text-muted-foreground">
                    <LockIcon className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>System type</TooltipContent>
              </Tooltip>
            ) : (
              <RelationshipTypeCardMenu
                onRenameFrom={() =>
                  setTimeout(() => setIsEditingFromName(true), 100)
                }
                onRenameTo={() =>
                  setTimeout(() => setIsEditingToName(true), 100)
                }
                onDelete={() => setDeleteOpen(true)}
              />
            )}
          </CardAction>
        </CardHeader>

        {/*<CardContent className="flex flex-col gap-1.5 px-4">
          <ExampleRow
            sourceLetter="A"
            targetLetter="B"
            value={type.FromName}
            placeholder="from label…"
          />
          <ExampleRow
            sourceLetter="B"
            targetLetter="A"
            value={type.ToName}
            placeholder="to label…"
          />
        </CardContent>*/}

        <CardContent className="flex items-center justify-between gap-2 border-t px-4 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {type.IsSystem && (
              <Badge variant="outline" className="text-xs gap-1">
                <LockIcon className="size-3" />
                System
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {usageLabel}
            </Badge>
          </div>

          {type.IsSystem ? (
            <Badge variant="secondary" className="text-xs gap-1">
              <LockIcon className="size-3" />
              {BEHAVIOR_LABEL[type.Behavior]}
            </Badge>
          ) : (
            <Select value={type.Behavior} onValueChange={handleBehaviorChange}>
              <SelectTrigger className="h-6 w-auto gap-1.5 px-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocking">Blocking</SelectItem>
                <SelectItem value="subtask">Subtask</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <DeleteRelationshipTypeDialog
        type={type}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
