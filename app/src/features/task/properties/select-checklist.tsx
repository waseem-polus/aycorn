import type { Task } from "@/types/types";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ChevronDown, GoalIcon, LandPlotIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type Props = {
  onChange?: (task: Task) => void;
  value?: number;
  onValueChange?: (value: number) => void;
  placeholder?: string;
};

export function SelectChecklist({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a checklist",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Checklists: checklists } = useContext(ProjectContext);
  const isControlled = onValueChange !== undefined;
  const [open, setOpen] = useState(false);

  const currentId = isControlled ? value : task.Checklist;
  const current = checklists.find((c) => c.ID === currentId);
  const displayName = current
    ? current.Name !== ""
      ? current.Name
      : "New Checklist"
    : placeholder;

  const handleSelect = (checklistId: number) => {
    setOpen(false);
    if (isControlled) {
      onValueChange(checklistId);
      return;
    }
    setTask({ ...task, Checklist: checklistId });
    onChange({ ...task, Checklist: checklistId });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="checklist"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            <LandPlotIcon
              className={cn(
                "size-4 shrink-0",
                !current && "text-muted-foreground",
              )}
            />
            <span
              className={cn("truncate", !current && "text-muted-foreground")}
            >
              {displayName}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search checklists..." />
          <CommandList>
            <CommandEmpty>No checklists found.</CommandEmpty>
            <CommandGroup>
              {checklists.map((checklist) => (
                <CommandItem
                  key={checklist.ID}
                  value={
                    checklist.Name !== ""
                      ? checklist.Name
                      : "Untitled Checklist"
                  }
                  onSelect={() => handleSelect(checklist.ID)}
                >
                  <LandPlotIcon className="size-4 shrink-0" />
                  <span className="flex-1">
                    {checklist.Name !== ""
                      ? checklist.Name
                      : "Untitled Checklist"}
                  </span>
                  {checklist.IsDefault && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline">
                          <GoalIcon className="text-muted-foreground" />
                          default
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        This is the default checklist for new tasks
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
