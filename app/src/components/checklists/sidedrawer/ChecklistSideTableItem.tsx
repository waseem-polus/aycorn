import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Ellipsis, Goal, Pencil } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableHeader } from "@/components/EditableHeader";
import type { ChecklistDetails } from "@/types/types";
import { cn } from "@/lib/utils";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import { useContext, useEffect, useRef, useState } from "react";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "@/components/ui/button";

export function ChecklistSideTableItem({
  checklist,
  autoFocus = false,
  onFocusConsumed,
}: {
  checklist: ChecklistDetails;
  autoFocus?: boolean;
  onFocusConsumed?: () => void;
}) {
  const { Project } = useContext(ProjectContext);
  const { update, deleteChecklist } = useChecklistMutation(Project.ID);
  const [isEditing, setIsEditing] = useState(autoFocus);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const displayName =
    checklist.Name === "" ? "Untitled Checklist" : checklist.Name;
  const titleClassName = cn("text-sm p-0 min-h-0 font-medium", {
    "line-through font-normal": checklist.Status === "done",
    "font-normal text-foreground-muted": checklist.Name === "",
  });

  useFocusAndSelect(editableRef, isEditing);

  useEffect(() => {
    if (autoFocus) onFocusConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  placeholder="Untitled Checklist"
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

          <div data-slot="item-description" className="pt-2">
            <Progress
              value={(checklist.DoneCount / checklist.TotalCount) * 100}
              className="w-full h-1.5"
            />
          </div>
        </ItemContent>
        <ItemActions className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="sm:invisible sm:group-hover:visible data-[state=open]:visible hover:cursor-pointer"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartEdit}>
                Rename
              </DropdownMenuItem>
              {!checklist.IsDefault && (
                <DropdownMenuItem
                  onClick={() =>
                    update.mutate({ ...checklist, IsDefault: true })
                  }
                >
                  Make default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteChecklist.mutate(checklist.ID)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </div>
    </Item>
  );
}
