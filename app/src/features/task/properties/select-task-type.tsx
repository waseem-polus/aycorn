import type { Task, TaskType, TaskTypeCategory } from "@/types/types";
import { useContext, useMemo, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
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
import { ChevronDown, ShapesIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  onChange?: (task: Task) => void;
  value?: TaskType;
  onValueChange?: (value: TaskType) => void;
  placeholder?: string;
};

type TypeGroup = {
  key: string;
  heading: string;
  types: TaskType[];
};

/**
 * Types come back as TaskTypeGlobal (with ProjectCount/TaskCount attached for
 * the task types page). Strip down to the plain TaskType before writing one
 * onto a task so the usage counters don't ride along into PUT /api/task.
 */
const toTaskType = (t: TaskType): TaskType => ({
  ID: t.ID,
  Name: t.Name,
  Description: t.Description,
  Icon: t.Icon,
  Color: t.Color,
  IsDefault: t.IsDefault,
  Category: t.Category,
});

const groupByCategory = (
  types: TaskType[],
  categories: TaskTypeCategory[],
): TypeGroup[] => {
  const known = new Set(categories.map((c) => c.ID));
  const groups: TypeGroup[] = [...categories]
    .sort((a, b) => a.SortOrder - b.SortOrder)
    .map((c) => ({
      key: `cat-${c.ID}`,
      heading: c.Name || "Untitled Category",
      types: types.filter((t) => t.Category === c.ID),
    }))
    .filter((g) => g.types.length > 0);

  // task_type.category is nullable, so a type can legitimately belong to no
  // category. The task types page never renders those; the selector must, or
  // they'd be unpickable.
  const orphans = types.filter((t) => !known.has(t.Category));
  if (orphans.length > 0) {
    groups.push({ key: "uncategorized", heading: "Uncategorized", types: orphans });
  }
  return groups;
};

export function SelectTaskType({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a type",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;
  const [open, setOpen] = useState(false);

  const { data: types = [] } = useTaskTypesQuery();
  const { data: categories = [] } = useTaskTypeCategoriesQuery();

  const groups = useMemo(
    () => groupByCategory(types, categories),
    [types, categories],
  );

  const current = isControlled ? value : task.Type;
  const displayName = current?.ID ? current.Name : placeholder;

  const handleSelect = (selected: TaskType) => {
    setOpen(false);
    const type = toTaskType(selected);
    if (isControlled) {
      onValueChange(type);
      return;
    }
    setTask({ ...task, Type: type });
    onChange({ ...task, Type: type });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="type"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            {current?.ID ? (
              <DynamicIcon
                name={current.Icon as IconName}
                className={cn(
                  "size-4 shrink-0",
                  stageStrokeClass(current.Color),
                )}
                fallback={() => <span className="size-4 shrink-0" />}
              />
            ) : (
                <ShapesIcon className="size-4 shrink-0 text-muted-foreground" />
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
                  to="/task-types"
                  className="text-primary hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Create a new one.
                </Link>
              </div>
            </CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.key} heading={group.heading}>
                {group.types.map((tt) => (
                  <CommandItem
                    key={tt.ID}
                    value={tt.Name}
                    onSelect={() => handleSelect(tt)}
                  >
                    <DynamicIcon
                      name={tt.Icon as IconName}
                      className={cn(
                        "size-4 shrink-0",
                        stageStrokeClass(tt.Color),
                      )}
                      fallback={() => <span className="size-4 shrink-0" />}
                    />
                    <span>{tt.Name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
