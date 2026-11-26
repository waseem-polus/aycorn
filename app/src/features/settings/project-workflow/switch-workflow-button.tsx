import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
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
import { useSwitchWorkflow } from "@/features/settings/project-workflow/hooks/useSwitchWorkflow";
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
  const { data: workflows } = useAllWorkflowsQuery();
  const { selectWorkflow, target, closeDialog, isPending } = useSwitchWorkflow({
    projectId,
    currentWorkflowId,
    currentStages,
  });

  const handleSelect = (workflow: { ID: number; Name: string }) => {
    if (workflow.ID === currentWorkflowId) return;
    setOpen(false);
    selectWorkflow(workflow);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="flex-1 sm:flex-none"
            disabled={isPending}
          >
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
            if (!next) closeDialog();
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
