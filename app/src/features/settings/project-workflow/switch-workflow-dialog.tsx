import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftRightIcon, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import type { Stage } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StageIcon } from "@/features/stage/stage-visual";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { useWorkflowDetailsQuery } from "@/features/workflows/shared/queries/useWorkflowDetailsQuery";
import { useProjectWorkflowMutation } from "@/features/settings/project-workflow/queries/useProjectWorkflowMutation";

const stageName = (stage: Stage) =>
  stage.Name !== "" ? stage.Name : "Untitled stage";

export function SwitchWorkflowDialog({
  open,
  onOpenChange,
  projectId,
  currentWorkflowName,
  fromStages,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  currentWorkflowName: string;
  fromStages: Stage[];
  target: { ID: number; Name: string };
}) {
  const { data: targetWorkflow } = useWorkflowDetailsQuery(target.ID, {
    enabled: open,
  });
  const { switchWorkflow } = useProjectWorkflowMutation(projectId);

  const targetStages = useMemo(
    () => targetWorkflow?.Stages ?? [],
    [targetWorkflow?.Stages],
  );

  const withTasks = fromStages.filter((s) => s.TaskCount > 0);
  const withoutTasks = fromStages.filter((s) => s.TaskCount === 0);
  const orderedStages = [...withTasks, ...withoutTasks];
  const totalTaskCount = withTasks.reduce((sum, s) => sum + s.TaskCount, 0);

  const [mappings, setMappings] = useState<Record<number, number>>({});

  // Auto-prefill each source stage with a target stage of the same type.
  useEffect(() => {
    if (!open || targetStages.length === 0) return;
    setMappings((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const next: Record<number, number> = {};
      for (const from of withTasks) {
        const match = targetStages.find((t) => t.Type === from.Type);
        if (match) next[from.ID] = match.ID;
      }
      return next;
    });
  }, [open, targetStages, withTasks]);

  const allMapped = withTasks.every((s) => mappings[s.ID] !== undefined);

  const handleOpenChange = (next: boolean) => {
    if (!next) setMappings({});
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const stageMappings: Record<string, number> = {};
    for (const [from, to] of Object.entries(mappings)) {
      stageMappings[from] = to;
    }

    switchWorkflow.mutate(
      { workflowId: target.ID, stageMappings },
      {
        onSuccess: (result) => {
          toast.success(
            `Switched to ${target.Name}. Moved ${result.success} task${
              result.success !== 1 ? "s" : ""
            }.`,
          );
          handleOpenChange(false);
        },
        onError: (err) =>
          toast.error(err.message || "Failed to switch workflow."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="box-border flex-1 sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-start sm:text-center">
            {currentWorkflowName} → {target.Name}
          </DialogTitle>
          <DialogDescription className="text-start sm:text-center">
            Route the{" "}
            <span className="font-bold">
              {totalTaskCount} task
              {totalTaskCount !== 1 ? "s" : ""}
            </span>{" "}
            currently in this project. Every stage that holds tasks must be
            mapped before you can switch.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-4 sm:gap-y-2">
          <p className="hidden sm:inline text-xs font-medium text-muted-foreground">
            From · {currentWorkflowName}
          </p>
          <span className="hidden sm:inline" />
          <p className="hidden sm:inline text-xs font-medium text-muted-foreground">
            To · {target.Name}
          </p>

          {orderedStages.map((stage) => {
            if (stage.TaskCount === 0) {
              return (
                <div
                  key={stage.ID}
                  className="col-span-1 sm:col-span-3 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <StageIcon stage={stage} className="shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {stageName(stage)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      No tasks
                    </span>
                  </span>
                  <StageTypeBadge type={stage.Type} />
                </div>
              );
            }

            const stageSelector = (
              <Select
                value={mappings[stage.ID]?.toString() ?? ""}
                onValueChange={(val) =>
                  setMappings((prev) => ({
                    ...prev,
                    [stage.ID]: Number(val),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a destination stage..." />
                </SelectTrigger>
                <SelectContent>
                  {targetStages.map((dest) => (
                    <SelectItem key={dest.ID} value={dest.ID.toString()}>
                      <span className="flex items-center gap-2">
                        <StageIcon stage={dest} className="shrink-0" />
                        <span className="truncate">{stageName(dest)}</span>
                        <StageTypeBadge type={dest.Type} />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

            return (
              <React.Fragment key={stage.ID}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 rounded-md border border-border px-3 py-2">
                  <span className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <StageIcon stage={stage} className="shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {stageName(stage)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stage.TaskCount} task{stage.TaskCount !== 1 ? "s" : ""}
                      </span>
                    </span>

                    <StageTypeBadge type={stage.Type} />
                  </span>

                  <div className="flex sm:hidden">{stageSelector}</div>
                </div>

                <ArrowLeftRightIcon className="hidden sm:flex text-muted-foreground size-4" />

                <div className="hidden sm:flex">{stageSelector}</div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <CircleAlert className="size-3.5 mt-0.5 shrink-0" />
          <span>You can map several stages to the same destination.</span>
        </div>

        <DialogFooter className="flex flex-row justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!allMapped || switchWorkflow.isPending}
            onClick={handleConfirm}
          >
            Switch & move {totalTaskCount} task
            {totalTaskCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
