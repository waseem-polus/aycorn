import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Goal, Pencil, Trash2 } from "lucide-react";
import ChecklistStatusIcon from "@/features/stage/checklist-status-icon";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { EditableHeader } from "@/components/EditableHeader";
import type { ChecklistDetails } from "@/types/types";
import { cn } from "@/lib/utils";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import { useContext, useEffect, useRef, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "@/components/ui/button";

export function ChecklistSideTableItem({
  checklist,
}: {
  checklist: ChecklistDetails;
}) {
  const { Project } = useContext(ProjectContext);
  const { update, deleteChecklist } = useChecklistMutation(Project.ID);
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const displayName =
    checklist.Name === "" ? "New Checklist" : checklist.Name;
  const titleClassName = cn("text-sm p-0 min-h-0 font-medium", {
    "line-through font-normal": checklist.Status === "done",
  });

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

  const handleSave = (newName: string) => {
    setIsEditing(false);
    if (newName !== checklist.Name) {
      update.mutate({ ...checklist, Name: newName });
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <Item asChild>
      <div className="group">
        <ItemMedia className="flex flex-col justify-center h-full">
          <ChecklistStatusIcon variant={checklist.Status} />
        </ItemMedia>
        <ItemContent>
          <span className="inline-flex gap-2 items-center">
            {checklist.IsDefault && (
              <Tooltip>
                <TooltipTrigger>
                  <Goal className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  This is the default checklist for new tasks
                </TooltipContent>
              </Tooltip>
            )}
            <ItemTitle
              className={
                checklist.Status === "done"
                  ? "line-through font-normal"
                  : "font-medium"
              }
            >
              {isEditing ? (
                <EditableHeader
                  ref={editableRef}
                  value={checklist.Name}
                  setValue={handleSave}
                  placeholder="New Checklist"
                  className={titleClassName}
                />
              ) : (
                <HoverCard openDelay={150} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <span className={cn("truncate", titleClassName)}>
                      {displayName}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="start"
                    className="flex w-auto items-center gap-2 py-1.5 px-2"
                  >
                    <span className="text-sm">{displayName}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-6"
                      onClick={handleStartEdit}
                      aria-label="Rename checklist"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </HoverCardContent>
                </HoverCard>
              )}
            </ItemTitle>
          </span>

          <ItemDescription className="pt-2">
            <Progress
              value={(checklist.DoneCount / checklist.TotalCount) * 100}
              className="w-2xs h-1.5"
            />
          </ItemDescription>
        </ItemContent>
        <ItemActions className="flex items-center">
          <Button
            onClick={() => deleteChecklist.mutate(checklist.ID)}
            size="icon-sm"
            variant="ghost"
            className="invisible group-hover:visible hover:cursor-pointer"
          >
            <Trash2 className="size-4" />
          </Button>
        </ItemActions>
      </div>
    </Item>
  );
}
