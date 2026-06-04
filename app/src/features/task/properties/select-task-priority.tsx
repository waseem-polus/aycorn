import type { Task } from "@/types/types";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ChevronDown, GaugeCircle } from "lucide-react";
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
import TaskPriorityIcon from "./icons/TaskPriorityIcon";

const PRIORITIES: Task["Priority"][] = ["Low", "Medium", "High", "Urgent"];

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Priority"];
  onValueChange?: (value: Task["Priority"]) => void;
  placeholder?: string;
};

export function SelectTaskPriority({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a priority",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;
  const [open, setOpen] = useState(false);

  const current = isControlled ? value : state.Priority;

  const handleSelect = (priority: Task["Priority"]) => {
    setOpen(false);
    if (isControlled) {
      onValueChange(priority);
      return;
    }
    setState({ ...state, Priority: priority });
    onChange({ ...state, Priority: priority });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="priority"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            {current ? (
              <TaskPriorityIcon variant={current} />
            ) : (
              <GaugeCircle className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn("truncate", !current && "text-muted-foreground")}
            >
              {current ?? placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search priorities..." />
          <CommandList>
            <CommandEmpty>No priorities found.</CommandEmpty>
            <CommandGroup>
              {PRIORITIES.map((priority) => (
                <CommandItem
                  key={priority}
                  value={priority}
                  onSelect={() => handleSelect(priority)}
                >
                  <TaskPriorityIcon variant={priority} />
                  <span>{priority}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
