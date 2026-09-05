import { useMemo, useState } from "react";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StageIcon } from "@/features/stage/stage-visual";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { useProjectWorkflowSettingsQuery } from "@/features/settings/project-workflow/queries/useProjectWorkflowSettingsQuery";
import { useProjectChecklistsQuery } from "@/features/task/transfer/queries/useProjectChecklistsQuery";
import { useTaskTransferMutation } from "@/features/task/transfer/queries/useTaskTransferMutation";
import { SelectDestinationProject } from "@/features/task/transfer/select-destination-project";
import { pluralize } from "@/utils/pluralize";
import type { Stage } from "@/types/types";

/** The little a transfer needs to know about the tasks it is moving. */
export type TransferTask = {
  ID: number;
  Name: string;
  Stage: number;
  Checklist: number;
  ChecklistName?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "move" | "copy";
  tasks: TransferTask[];
  excludeProjectId?: number | null;
  onSuccess?: () => void;
};

const stageName = (stage: Stage) =>
  stage.Name !== "" ? stage.Name : "Untitled stage";

// The stage type most of the selection sits on, used to preselect an equivalent
// stage in the destination workflow.
const dominantStageType = (tasks: TransferTask[], sourceStages: Stage[]) => {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    const type = sourceStages.find((s) => s.ID === task.Stage)?.Type;
    if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  let best: string | undefined;
  for (const [type, count] of counts) {
    if (best === undefined || count > (counts.get(best) ?? 0)) best = type;
  }
  return best;
};

export function TransferTasksDialog({
  open,
  onOpenChange,
  mode,
  tasks,
  excludeProjectId,
  onSuccess,
}: Props) {
  const [destProjectId, setDestProjectId] = useState<number | null>(null);
  // Only the user's explicit picks live in state; the effective values are
  // derived, so a destination change re-derives instead of racing an effect.
  const [checklistPick, setChecklistPick] = useState<number | null>(null);
  const [stagePick, setStagePick] = useState<number | null>(null);
  const [copyRelationships, setCopyRelationships] = useState(false);

  const { moveTasks, copyTasks } = useTaskTransferMutation();
  const pending = moveTasks.isPending || copyTasks.isPending;

  const wantsDestination = open && destProjectId !== null;
  const { data: destSettings } = useProjectWorkflowSettingsQuery(
    destProjectId ?? 0,
    { enabled: wantsDestination },
  );
  const { data: destChecklists } = useProjectChecklistsQuery(
    destProjectId ?? 0,
    { enabled: wantsDestination },
  );

  // Source stages come from the global list: a selection can span projects
  // (/upcoming), so there is no single project's stage list to read.
  const { data: allStages } = useAllStagesQuery();
  const destStages = useMemo(
    () => destSettings?.Stages ?? [],
    [destSettings?.Stages],
  );
  const loaded = destStages.length > 0 && destChecklists !== undefined;

  // Stages belong to a workflow, not a project, so they carry over untouched
  // whenever the destination project happens to run the same workflow. Only
  // when they can't does the user have to pick a replacement.
  const needsStage =
    loaded && !tasks.every((t) => destStages.some((s) => s.ID === t.Stage));

  // Suggested checklist: reuse the name the tasks already share if the
  // destination has one, otherwise its default.
  const suggestedChecklistId = useMemo(() => {
    if (destChecklists === undefined) return null;
    const names = new Set(tasks.map((t) => t.ChecklistName));
    const sharedName = names.size === 1 ? [...names][0] : undefined;
    const byName = destChecklists.find((c) => c.Name === sharedName);
    const byDefault = destChecklists.find((c) => c.IsDefault);
    return byName?.ID ?? byDefault?.ID ?? destChecklists[0]?.ID ?? null;
  }, [destChecklists, tasks]);

  // Suggested stage: the destination's equivalent of the stage type most of
  // the selection already sits on.
  const suggestedStageId = useMemo(() => {
    if (destStages.length === 0) return null;
    const type = dominantStageType(tasks, allStages ?? []);
    const match = destStages.find((s) => s.Type === type);
    return (match ?? destStages[0]).ID;
  }, [destStages, allStages, tasks]);

  const checklistId = checklistPick ?? suggestedChecklistId;
  const stageId = stagePick ?? suggestedStageId;

  const handleDestinationChange = (projectId: number) => {
    setDestProjectId(projectId);
    setChecklistPick(null);
    setStagePick(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDestProjectId(null);
      setChecklistPick(null);
      setStagePick(null);
      setCopyRelationships(false);
    }
    onOpenChange(next);
  };

  const count = tasks.length;
  const destName = destSettings?.Project.Name ?? "";
  const ready = loaded && checklistId !== null && (!needsStage || stageId !== null);

  const handleConfirm = () => {
    if (!ready || checklistId === null) return;
    const ids = tasks.map((t) => t.ID);
    const stage = needsStage && stageId !== null ? stageId : undefined;

    if (mode === "move") {
      moveTasks.mutate(
        { ids, checklist: checklistId, stage },
        {
          onSuccess: (result) => {
            bulkResultToast(
              result,
              `Moved ${pluralize(result.success, "task")} to ${destName}.`,
            );
            handleOpenChange(false);
            onSuccess?.();
          },
          onError: (err) => toast.error(err.message || "Failed to move tasks."),
        },
      );
      return;
    }

    copyTasks.mutate(
      { ids, checklist: checklistId, stage, copyRelationships },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Copied ${pluralize(result.success, "task")} to ${destName}.`,
          );
          handleOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => toast.error(err.message || "Failed to copy tasks."),
      },
    );
  };

  const verb = mode === "move" ? "Move" : "Copy";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {verb} {pluralize(count, "task")} to another project
          </DialogTitle>
          <DialogDescription>
            The name, description, type, assignee, priority and dates come
            across as they are. Checklists and stages belong to a project, so
            those need a destination.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <SelectDestinationProject
              value={destProjectId}
              onValueChange={handleDestinationChange}
              excludeProjectId={excludeProjectId}
              autoFocus
            />
          </div>

          {destProjectId !== null && (
            <div className="flex flex-col gap-1.5">
              <Label>Checklist</Label>
              <Select
                value={checklistId?.toString() ?? ""}
                onValueChange={(val) => setChecklistPick(Number(val))}
                disabled={!loaded}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loaded ? "Pick a checklist..." : "Loading checklists..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(destChecklists ?? []).map((checklist) => (
                    <SelectItem
                      key={checklist.ID}
                      value={checklist.ID.toString()}
                    >
                      {checklist.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needsStage && (
            <div className="flex flex-col gap-1.5">
              <Label>Stage</Label>
              <Select
                value={stageId?.toString() ?? ""}
                onValueChange={(val) => setStagePick(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a stage..." />
                </SelectTrigger>
                <SelectContent>
                  {destStages.map((stage) => (
                    <SelectItem key={stage.ID} value={stage.ID.toString()}>
                      <span className="flex items-center gap-2">
                        <StageIcon stage={stage} className="shrink-0" />
                        <span className="truncate">{stageName(stage)}</span>
                        <StageTypeBadge type={stage.Type} />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <CircleAlert className="size-3.5 mt-0.5 shrink-0" />
                <span>
                  {destName} uses a different workflow, so the current stages
                  can't carry over. All {pluralize(count, "task")} will land on
                  the stage you pick.
                </span>
              </div>
            </div>
          )}

          {mode === "copy" && (
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={copyRelationships}
                onCheckedChange={(checked) =>
                  setCopyRelationships(checked === true)
                }
              />
              Also copy task links
            </Label>
          )}

          {count === 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground truncate">
                  {verb === "Move" ? "Moving" : "Copying"}: {tasks[0].Name || "Untitled Task"}
                </p>
              </TooltipTrigger>
              <TooltipContent>{tasks[0].Name || "Untitled Task"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!ready || pending} onClick={handleConfirm}>
            {verb} {pluralize(count, "task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
