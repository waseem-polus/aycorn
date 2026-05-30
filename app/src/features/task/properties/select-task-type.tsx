import type { Task, TaskType } from "@/types/types";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectTaskTypesQuery } from "@/features/task-types/queries/useProjectTaskTypesQuery";
import { DynamicIcon } from "lucide-react/dynamic";
import { stageStrokeClass } from "@/features/stage/stage-palette";
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
import { ChevronDown, TagsIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  onChange?: (task: Task) => void;
  value?: TaskType;
  onValueChange?: (value: TaskType) => void;
  placeholder?: string;
};

export function SelectTaskType({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a type",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const isControlled = onValueChange !== undefined;
  const [open, setOpen] = useState(false);

  const { data: types = [] } = useProjectTaskTypesQuery(Project.ID);

  const current = isControlled ? value : task.Type;
  const displayName = current?.ID ? current.Name : placeholder;

  const handleSelect = (selected: TaskType) => {
    setOpen(false);
    if (isControlled) {
      onValueChange(selected);
      return;
    }
    setTask({ ...task, Type: selected });
    onChange({ ...task, Type: selected });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="type"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            {current?.ID ? (
              <DynamicIcon
                name={current.Icon as any}
                className={cn(
                  "size-4 shrink-0",
                  stageStrokeClass(current.Color),
                )}
              />
            ) : (
              <TagsIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn(
                "truncate",
                current?.ID ? "" : "text-muted-foreground",
              )}
            >
              {displayName}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search types..." />
          <CommandList>
            <CommandEmpty>
              <div className="text-sm text-muted-foreground">
                No types found.{" "}
                <Link
                  to="/project/settings/$projectId"
                  params={{ projectId: String(Project.ID) }}
                  search={{ tab: "task-types" }}
                  className="text-primary hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Enable in project settings
                </Link>{" "}
                or{" "}
                <Link
                  to="/task-types"
                  className="text-primary hover:underline"
                  onClick={() => setOpen(false)}
                >
                  create a new one.
                </Link>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {types.map((tt) => (
                <CommandItem
                  key={tt.ID}
                  value={tt.Name}
                  onSelect={() => handleSelect(tt)}
                >
                  <DynamicIcon
                    name={tt.Icon as any}
                    className={cn(
                      "size-4 shrink-0",
                      stageStrokeClass(tt.Color),
                    )}
                  />
                  <span>{tt.Name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
