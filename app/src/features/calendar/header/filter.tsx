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
import type { Type } from "@/types/types";

export default function FilterEvents() {
  const { selectedTypes, filterEventsBySelectedTypes, clearFilter } =
    useCalendar();

  const taskTypes: Type[] = ["Dev", "Reminder", "Test"];

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
            key={taskType}
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              filterEventsBySelectedTypes(taskType);
            }}
          >
            <div
              className={`size-3.5 rounded-full bg-${taskType}-600 dark:bg-${taskType}-700`}
            />
            <span className="capitalize flex justify-center items-center gap-2">
              {taskType}
              <span>
                {selectedTypes.includes(taskType) && (
                  <CheckIcon className="size-4" />
                )}
              </span>
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
