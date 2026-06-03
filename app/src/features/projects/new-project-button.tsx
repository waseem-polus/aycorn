import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
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
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const { data: workflows } = useAllWorkflowsQuery();
  const { createProject } = useAllProjectsMutation();
  const navigate = useNavigate();

  const onSuccess = (id: number) =>
    navigate({ to: "/project/$projectId", params: { projectId: String(id) } });

  const handleClick = () => {
    if ((workflows ?? []).length === 1) {
      createProject.mutate(
        { workflowId: workflows![0].ID },
        {
          onSuccess,
          onError: (err) =>
            toast.error(err.message || "Failed to create project."),
        },
      );
      return;
    }
    setOpen(true);
  };

  const handleSelect = (workflow: { ID: number; Name: string }) => {
    setOpen(false);
    createProject.mutate(
      { workflowId: workflow.ID },
      {
        onSuccess,
        onError: (err) =>
          toast.error(err.message || "Failed to create project."),
      },
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="hover:cursor-pointer"
          disabled={createProject.isPending}
          onClick={handleClick}
        >
          <Plus />
          New Project
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <Command>
          <CommandInput placeholder="Search workflows..." />
          <CommandList>
            <CommandEmpty>No workflows found.</CommandEmpty>
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
