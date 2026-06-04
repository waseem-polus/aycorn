import type { Task } from "@/types/types";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ChevronDown, Layers2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StageIcon } from "./stage-visual";
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

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Stage"];
  onValueChange?: (value: Task["Stage"]) => void;
  placeholder?: string;
};

export function SelectTaskStage({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a stage",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const { Stages } = useContext(ProjectContext);
  const isControlled = onValueChange !== undefined;
  const [open, setOpen] = useState(false);

  const currentId = isControlled ? value : state.Stage;
  const current = Stages.find((s) => s.ID === currentId);

  const handleSelect = (stageId: number) => {
    setOpen(false);
    if (isControlled) {
      onValueChange(stageId);
      return;
    }
    setState({ ...state, Stage: stageId });
    onChange({ ...state, Stage: stageId });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="stage"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            {current ? (
              <StageIcon stage={current} />
            ) : (
              <Layers2 className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn("truncate", !current && "text-muted-foreground")}
            >
              {current ? current.Name : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search stages..." />
          <CommandList>
            <CommandEmpty>No stages found.</CommandEmpty>
            <CommandGroup>
              {Stages.map((stage) => (
                <CommandItem
                  key={stage.ID}
                  value={stage.Name}
                  onSelect={() => handleSelect(stage.ID)}
                >
                  <StageIcon stage={stage} />
                  <span>{stage.Name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
