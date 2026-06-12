import { Card } from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { EditableHeader } from "@/components/EditableHeader";
import ChecklistStatusIcon from "@/features/stage/checklist-status-icon";
import { stageCalendarBadgeClass } from "@/features/stage/stage-palette";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import { DeleteChecklistDialog } from "@/features/checklists/delete-checklist-dialog";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import type { ChecklistDetails } from "@/types/types";
import { cn } from "@/lib/utils";
import { Ellipsis, Goal } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

export function ChecklistCard({
  checklist,
  autoFocus = false,
  onFocusConsumed,
}: {
  checklist: ChecklistDetails;
  autoFocus?: boolean;
  onFocusConsumed?: () => void;
}) {
  const { Project, Stages, Checklists } = useContext(ProjectContext);
  const { update } = useChecklistMutation(Project.ID);
  const [isEditingName, setIsEditingName] = useState(autoFocus);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLHeadingElement>(null);

  useFocusAndSelect(nameRef, isEditingName);
  useFocusAndSelect(descriptionRef, isEditingDescription);

  useEffect(() => {
    if (autoFocus) onFocusConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countByStage = new Map(
    checklist.StageCounts.map((s) => [s.StageID, s.Count]),
  );

  const handleSaveName = (newName: string) => {
    setIsEditingName(false);
    if (newName !== checklist.Name) {
      update.mutate({ ...checklist, Name: newName });
    }
  };

  const handleSaveDescription = (newDescription: string) => {
    setIsEditingDescription(false);
    if (newDescription !== checklist.Description) {
      update.mutate({ ...checklist, Description: newDescription });
    }
  };

  const candidates = Checklists.filter((c) => c.ID !== checklist.ID);

  return (
    <>
    <DeleteChecklistDialog
      checklist={checklist}
      candidates={candidates}
      projectId={Project.ID}
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
    />
    <Card className="overflow-hidden rounded-lg shadow-none p-4 pt-3 flex flex-col gap-2 shrink-0">
      <SegmentedProgress
        variant="labeled"
        segments={Stages.map((stage) => ({
          count: countByStage.get(stage.ID) ?? 0,
          className: cn(stageCalendarBadgeClass(stage.Color), "border"),
          label: stage.Name,
        }))}
        className="h-6 rounded-none gap-1 my-1"
      />
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip>
          <TooltipTrigger>
            <ChecklistStatusIcon
              variant={checklist.Status}
              doneCount={checklist.DoneCount}
              totalCount={checklist.TotalCount}
            />
          </TooltipTrigger>
          <TooltipContent>
            {checklist.Status === "unused" && "No tasks"}
            {checklist.Status !== "unused" &&
              `${checklist.DoneCount} of ${checklist.TotalCount} done (${((checklist.DoneCount / checklist.TotalCount) * 100).toFixed(0)}%)`}
          </TooltipContent>
        </Tooltip>
        <div className="flex-1 min-w-0" onKeyDown={(e) => e.stopPropagation()}>
          <EditableHeader
            ref={nameRef}
            value={checklist.Name}
            setValue={handleSaveName}
            onBlur={() => setIsEditingName(false)}
            placeholder="Untitled Checklist"
            className="text-sm font-medium p-0 min-h-0 cursor-text"
          />
        </div>
        {checklist.IsDefault && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs shrink-0">
                <Goal className="text-muted-foreground" />
                Default
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              This is the default checklist for new tasks
            </TooltipContent>
          </Tooltip>
        )}
        <span className="text-muted-foreground text-xs font-light shrink-0">
          {checklist.TotalCount > 0 ? (
            <>
              <span className="text-foreground font-semibold">
                {checklist.DoneCount}
              </span>{" "}
              of {checklist.TotalCount} done{" "}
            </>
          ) : (
            "No tasks"
          )}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="hover:cursor-pointer shrink-0"
            >
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setTimeout(() => setIsEditingName(true), 100)}
            >
              Rename
            </DropdownMenuItem>
            {!checklist.IsDefault && (
              <DropdownMenuItem
                onClick={() => update.mutate({ ...checklist, IsDefault: true })}
              >
                Make default
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={candidates.length === 0}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div onKeyDown={(e) => e.stopPropagation()}>
        <EditableHeader
          ref={descriptionRef}
          value={checklist.Description}
          setValue={handleSaveDescription}
          onBlur={() => setIsEditingDescription(false)}
          placeholder="Click to add a description..."
          className="text-xs font-normal text-muted-foreground p-0 min-h-0 cursor-text"
        />
      </div>
    </Card>
    </>
  );
}
