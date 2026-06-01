import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useContext } from "react";

export default function UpcomingRowProjectChecklist() {
  const {
    state: { ChecklistName },
  } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="truncate text-xs text-muted-foreground">
          {Project.Name} · {ChecklistName}
        </span>
      </TooltipTrigger>
      {ChecklistName && (
        <TooltipContent>
          {Project.Name} · {ChecklistName}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
