import { useContext } from "react";
import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectTaskTypesQuery } from "@/features/task-types/queries/useProjectTaskTypesQuery";
import { stageSwatchClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

export default function FilterEvents() {
  const { selectedTypes, filterEventsBySelectedTypes, clearFilter } =
    useCalendar();
  const { Project } = useContext(ProjectContext);
  const { data: taskTypes = [] } = useProjectTaskTypesQuery(Project.ID);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Toggle variant="outline" className="cursor-pointer w-fit">
          <Filter className="h-4 w-4" />
        </Toggle>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {taskTypes.map((taskType) => (
          <DropdownMenuItem
            key={taskType.ID}
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              filterEventsBySelectedTypes(taskType.ID);
            }}
          >
            <div
              className={cn(
                "size-3.5 rounded-full shrink-0",
                stageSwatchClass(taskType.Color),
              )}
            />
            <span className="flex justify-center items-center gap-2">
              {taskType.Name}
              {selectedTypes.includes(taskType.ID) && (
                <CheckIcon className="size-4" />
              )}
            </span>
          </DropdownMenuItem>
        ))}
        <Separator className="my-2" />
        <DropdownMenuItem
          disabled={selectedTypes.length === 0}
          className="flex gap-2 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            clearFilter();
          }}
        >
          <RefreshCcw className="size-3.5" />
          Clear Filter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
