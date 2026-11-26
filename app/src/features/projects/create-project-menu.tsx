import { useState } from "react";
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
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useCreateProject } from "@/features/projects/hooks/useCreateProject";
import { useCreateWorkflow } from "@/features/workflows/shared/hooks/useCreateWorkflow";

type Props = {
  folderId?: number;
  onCreated?: (id: number) => void;
  navigateOnCreate?: boolean;
  renderTrigger: (props: {
    onClick: () => void;
    disabled: boolean;
  }) => React.ReactNode;
};

export function CreateProjectMenu({
  folderId,
  onCreated,
  navigateOnCreate = false,
  renderTrigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const { data: workflows } = useAllWorkflowsQuery();
  const { create, isPending } = useCreateProject({
    folderId,
    onCreated,
    navigateOnCreate,
  });
  const { create: handleCreateWorkflow } = useCreateWorkflow();

  const handleTriggerClick = () => {
    if ((workflows ?? []).length === 1) {
      create(workflows![0].ID);
      return;
    }
    setOpen(true);
  };

  const handleSelect = (workflow: { ID: number; Name: string }) => {
    setOpen(false);
    create(workflow.ID);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger({
          onClick: handleTriggerClick,
          disabled: isPending,
        })}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <Command>
          <CommandInput placeholder="Search workflows..." />
          <CommandList>
            <CommandEmpty>
              No workflows found.{" "}
              <button
                className="underline hover:cursor-pointer"
                onClick={handleCreateWorkflow}
              >
                Create a workflow here
              </button>
            </CommandEmpty>
            <CommandGroup>
              {(workflows ?? []).map((workflow) => (
                <CommandItem
                  key={workflow.ID}
                  value={`${workflow.Name} ${workflow.Description}`}
                  onSelect={() => handleSelect(workflow)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {workflow.Name === ""
                        ? "Untitled Workflow"
                        : workflow.Name}
                    </span>
                    {workflow.Description && (
                      <span className="truncate text-xs text-muted-foreground">
                        {workflow.Description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
