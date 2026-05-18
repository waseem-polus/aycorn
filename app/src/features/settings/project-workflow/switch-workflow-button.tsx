import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Stage } from "@/types/types";
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
import { useProjectWorkflowMutation } from "@/features/settings/project-workflow/queries/useProjectWorkflowMutation";
import { SwitchWorkflowDialog } from "@/features/settings/project-workflow/switch-workflow-dialog";

export function SwitchWorkflowButton({
  projectId,
  currentWorkflowId,
  currentWorkflowName,
  currentStages,
}: {
  projectId: number;
  currentWorkflowId: number;
  currentWorkflowName: string;
  currentStages: Stage[];
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<{ ID: number; Name: string } | null>(
    null,
  );
  const { data: workflows } = useAllWorkflowsQuery();
  const { switchWorkflow } = useProjectWorkflowMutation(projectId);

  const hasTasks = currentStages.some((s) => s.TaskCount > 0);

  const handleSelect = (workflow: { ID: number; Name: string }) => {
    if (workflow.ID === currentWorkflowId) return;
    setOpen(false);

    if (!hasTasks) {
      switchWorkflow.mutate(
        { workflowId: workflow.ID, stageMappings: {} },
        {
          onSuccess: () => toast.success(`Switched to ${workflow.Name}.`),
          onError: (err) =>
            toast.error(err.message || "Failed to switch workflow."),
        },
      );
      return;
    }

    setTarget(workflow);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button disabled={switchWorkflow.isPending}>
            <RefreshCw />
            Switch workflow
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[360px] p-0">
          <Command>
            <CommandInput placeholder="Search workflows..." />
            <CommandList>
              <CommandEmpty>No workflows found.</CommandEmpty>
              <CommandGroup>
                {(workflows ?? []).map((workflow) => {
                  const isCurrent = workflow.ID === currentWorkflowId;
                  return (
                    <CommandItem
                      key={workflow.ID}
                      value={`${workflow.Name} ${workflow.Description}`}
                      disabled={isCurrent}
                      onSelect={() => handleSelect(workflow)}
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-2 truncate">
                          {workflow.Name === ""
                            ? "Untitled Workflow"
                            : workflow.Name}
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Check className="size-3" />
                              Active
                            </span>
                          )}
                        </span>
                        {workflow.Description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {workflow.Description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {target && (
        <SwitchWorkflowDialog
          open={target !== null}
          onOpenChange={(next) => {
            if (!next) setTarget(null);
          }}
          projectId={projectId}
          currentWorkflowName={currentWorkflowName}
          fromStages={currentStages}
          target={target}
        />
      )}
    </>
  );
}
