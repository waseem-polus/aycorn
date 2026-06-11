import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Ellipsis, Goal, Pencil } from "lucide-react";
import ChecklistStatusIcon from "@/features/stage/checklist-status-icon";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
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
import { stageCalendarBadgeClass } from "@/features/stage/stage-palette";

export function ChecklistSideTableItem({
  checklist,
  autoFocus = false,
  onFocusConsumed,
}: {
  checklist: ChecklistDetails;
  autoFocus?: boolean;
  onFocusConsumed?: () => void;
}) {
  const { Project, Stages } = useContext(ProjectContext);
  const { update, deleteChecklist } = useChecklistMutation(Project.ID);
  const [isEditing, setIsEditing] = useState(autoFocus);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const displayName =
    checklist.Name === "" ? "Untitled Checklist" : checklist.Name;
  const titleClassName = cn("text-sm p-0 min-h-0", {
    "text-muted-foreground": checklist.Name === "",
  });

  const countByStage = new Map(
    checklist.StageCounts.map((s) => [s.StageID, s.Count]),
  );

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
        <ItemContent className="min-w-0">
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
            <ItemTitle className="flex justify-between w-full min-w-0 font-medium">
              {isEditing ? (
                <EditableHeader
                  ref={editableRef}
                  value={checklist.Name}
                  setValue={handleSave}
                  placeholder="Untitled Checklist"
                  className={titleClassName}
                />
              ) : (
                <>
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

                  <span className="text-muted-foreground text-xs font-light">
                    {checklist.TotalCount > 0
                      ? `${checklist.DoneCount}/${checklist.TotalCount}`
                      : "N/A"}
                  </span>
                </>
              )}
            </ItemTitle>
          </span>

          <div data-slot="item-description" className="pt-2">
            <SegmentedProgress
              variant="labeled"
              segments={Stages.map((stage) => ({
                count: countByStage.get(stage.ID) ?? 0,
                className: cn(stageCalendarBadgeClass(stage.Color), "border"),
                label: stage.Name,
              }))}
              className="h-6"
            />
          </div>
        </ItemContent>
        <ItemActions className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="data-[state=open]:visible hover:cursor-pointer"
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
