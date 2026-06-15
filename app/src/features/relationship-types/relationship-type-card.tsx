import { useRef, useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { ArrowRightIcon, LinkIcon, LockIcon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { EditableHeader } from "@/components/EditableHeader";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { DeleteRelationshipTypeDialog } from "@/features/relationship-types/delete-relationship-type-dialog";
import type { RelationshipBehavior, TaskRelationshipType } from "@/types/types";

export const BEHAVIOR_COLOR: Record<RelationshipBehavior, string> = {
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
  const { updateRelationshipTypeIcon, updateRelationshipTypeNames, updateRelationshipType } =
    useRelationshipTypeMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditingFromName, setIsEditingFromName] = useState(false);
  const [isEditingToName, setIsEditingToName] = useState(false);
  const fromNameRef = useRef<HTMLHeadingElement>(null);
  const toNameRef = useRef<HTMLHeadingElement>(null);

  useFocusAndSelect(fromNameRef, isEditingFromName);
  useFocusAndSelect(toNameRef, isEditingToName);

  const color = BEHAVIOR_COLOR[type.Behavior] ?? "gray";

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
      <Card className="gap-2 rounded-lg py-4 shadow-none">
        <CardHeader className="gap-1 px-4">
          <CardTitle className="font-medium flex items-start gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <IconPickerPopover
                value={type.Icon}
                onSelect={handleIconSelect}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Change icon">
                    <DynamicIcon
                      name={(type.Icon || "link") as IconName}
                      className={stageStrokeClass(color)}
                      fallback={() => <LinkIcon className={stageStrokeClass(color)} />}
                    />
                  </Button>
                }
              />
            </div>

            <div className="flex flex-1 items-center gap-2 min-w-0 flex-wrap" onKeyDown={(e) => e.stopPropagation()}>
              <EditableHeader
                ref={fromNameRef}
                value={type.FromName}
                setValue={handleFromNameSave}
                onBlur={() => setIsEditingFromName(false)}
                placeholder="From name…"
                className="text-base font-medium p-0 min-h-0 cursor-text min-w-12"
              />
              <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <EditableHeader
                ref={toNameRef}
                value={type.ToName}
                setValue={handleToNameSave}
                onBlur={() => setIsEditingToName(false)}
                placeholder="To name…"
                className="text-base font-medium p-0 min-h-0 cursor-text min-w-12"
              />
            </div>

            <CardAction className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem onClick={() => setTimeout(() => setIsEditingFromName(true), 100)}>
                    Rename "from" label
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeout(() => setIsEditingToName(true), 100)}>
                    Rename "to" label
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {type.IsSystem ? (
                    <DropdownMenuItem disabled>
                      <LockIcon className="text-muted-foreground" />
                      Delete
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-2 px-4">
          {type.IsSystem ? (
            <Badge variant="outline" className="text-xs gap-1">
              <LockIcon className="size-3" />
              System
            </Badge>
          ) : (
            <Select
              value={type.Behavior}
              onValueChange={handleBehaviorChange}
            >
              <SelectTrigger className="h-6 text-xs px-2 w-auto gap-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocking">Blocking</SelectItem>
                <SelectItem value="subtask">Subtask</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          )}

          {type.IsSystem && (
            <Badge variant="secondary" className="text-xs">
              {BEHAVIOR_LABEL[type.Behavior]}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs text-muted-foreground">
            {(type.UsageCount ?? 0) === 1 ? "1 relationship" : `${type.UsageCount ?? 0} relationships`}
          </Badge>
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
