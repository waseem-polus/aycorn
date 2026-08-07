import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
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
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";

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
  const { createProject } = useAllProjectsMutation();
  const { createWorkflow } = useWorkflowMutation();
  const navigate = useNavigate();

  const create = (workflowId: number) => {
    createProject.mutate(
      { workflowId, folder: folderId },
      {
        onSuccess: (id) => {
          onCreated?.(id);
          if (navigateOnCreate) {
            navigate({
              to: "/project/$projectId",
              params: { projectId: String(id) },
            });
          }
        },
        onError: (err) =>
          toast.error(err.message || "Failed to create project."),
      },
    );
  };

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

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (newId) => {
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(newId) },
          search: { new: true },
        });
      },
      onError: () => toast.error("Failed to create workflow."),
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger({
          onClick: handleTriggerClick,
          disabled: createProject.isPending,
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
