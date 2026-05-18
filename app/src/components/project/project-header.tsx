import { useContext } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);

  return (
    <>
      {Project.TimeModified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-muted-foreground">
              Modified{" "}
              {formatDistanceToNow(new Date(Project.TimeModified), {
                addSuffix: true,
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {format(new Date(Project.TimeModified), "MMM d, yyyy (h:mm a)")}
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
