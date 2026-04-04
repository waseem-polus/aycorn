import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Goal, Trash2 } from "lucide-react";
import TaskStatusIcon from "@/features/task/properties/icons/TaskStatusIcon";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableHeader } from "@/components/EditableHeader";
import type { ChecklistDetails } from "@/types/types";
import { cn } from "@/lib/utils";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "@/components/ui/button";

export function ChecklistSideTableItem({
  checklist,
}: {
  checklist: ChecklistDetails;
}) {
  const { Project } = useContext(ProjectContext);
  const { update, deleteChecklist } = useChecklistMutation(Project.ID);

  return (
    <Item asChild>
      <div className="group">
        <ItemMedia className="flex flex-col justify-center h-full">
          <TaskStatusIcon variant={checklist.Status} />
        </ItemMedia>
        <ItemContent>
          <span className="inline-flex gap-2">
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
                checklist.Status === "Done"
                  ? "line-through font-normal"
                  : "font-medium"
              }
            >
              <EditableHeader
                value={checklist.Name}
                setValue={(newName) =>
                  update.mutate({ ...checklist, Name: newName })
                }
                placeholder="New Checklist"
                className={cn("text-sm p-0 min-h-0 font-medium", {
                  "line-through font-normal": checklist.Status === "Done",
                })}
              />
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
