import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ProjectIcon } from "@/features/projects/project-icon";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { cn } from "@/lib/utils";

type Props = {
  value: number | null;
  onValueChange: (projectId: number) => void;
  // The selection's own project, hidden from the list: moving there is a no-op
  // and copying there is the separate Duplicate action. Omitted for
  // cross-project selections, which have no single "own" project.
  excludeProjectId?: number | null;
  autoFocus?: boolean;
};

export function SelectDestinationProject({
  value,
  onValueChange,
  excludeProjectId,
  autoFocus,
}: Props) {
  const [open, setOpen] = useState(false);
  // Archived projects are deliberately excluded — filing a task into an
  // archive isn't a move anyone means to make from this dialog.
  const { data: projects, isPending } = useAllProjectsQuery(false);

  const options = (projects ?? []).filter((p) => p.ID !== excludeProjectId);
  const selected = options.find((p) => p.ID === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          autoFocus={autoFocus}
          disabled={isPending}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <ProjectIcon project={selected} />
                <span className="truncate">{selected.Name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {isPending ? "Loading projects..." : "Choose a project..."}
              </span>
            )}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup>
              {options.map((project) => (
                <CommandItem
                  key={project.ID}
                  value={project.Name}
                  onSelect={() => {
                    onValueChange(project.ID);
                    setOpen(false);
                  }}
                >
                  <ProjectIcon project={project} />
                  <span className="truncate">{project.Name}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      project.ID === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
