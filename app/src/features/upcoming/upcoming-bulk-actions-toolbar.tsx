import { useMemo } from "react";
import type { Task, TaskWithProject } from "@/types/types";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import { useUpcomingBulkMutation } from "@/features/upcoming/queries/useUpcomingBulkMutation";
import { AddRelationshipButton } from "@/features/task/relationships/bulk-add-relationship-button";
import { useSharedSelection } from "@/hooks/useSelection";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { pluralize } from "@/utils/pluralize";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import {
  sharedTaskType,
  toWireChanges,
} from "@/features/task/shared/shared-task-type";

const sharedValue = <K extends keyof Task>(
  tasks: TaskWithProject[],
  key: K,
): Task[K] | undefined => {
  if (tasks.length === 0) return undefined;
  const first = tasks[0][key];
  return tasks.every((t) => t[key] === first) ? first : undefined;
};

type Props = {
  tasks: TaskWithProject[];
};

export function UpcomingBulkActionsToolbar({ tasks }: Props) {
  const { selectedIds, clearSelection } = useSharedSelection();
  const { bulkUpdate, bulkDelete } = useUpcomingBulkMutation();

  const selectedTasks = useMemo(
    () => tasks.filter((t) => selectedIds.has(t.ID.toString())),
    [tasks, selectedIds],
  );

  const sharedType = useMemo(
    () => sharedTaskType(selectedTasks),
    [selectedTasks],
  );

  const selectedIdNumbers = useMemo(
    () => [...selectedIds].map(Number),
    [selectedIds],
  );

  const handleBulkDelete = () => {
    bulkDelete.mutate(selectedIdNumbers, {
      onSuccess: () => clearSelection(),
    });
  };

  const handleBulkUpdate = (changes: Partial<Task>) => {
    bulkUpdate.mutate(
      { ids: selectedIdNumbers, changes: toWireChanges(changes) },
      {
        onSuccess: (result) => {
          bulkResultToast(result, `Updated ${pluralize(result.success, "task")}.`);
          clearSelection();
        },
      },
    );
  };

  return (
    <BulkActionsToolbarBase
      count={selectedIds.size}
      onClear={clearSelection}
      delete={{
        title: `Delete ${pluralize(selectedIds.size, "task")}?`,
        description: "This cannot be undone.",
        onConfirm: handleBulkDelete,
        busy: bulkDelete.isPending,
      }}
    >
      <div className="w-32">
        <SelectTaskPriority
          value={sharedValue(selectedTasks, "Priority")}
          onValueChange={(v) => handleBulkUpdate({ Priority: v })}
          placeholder={
            sharedValue(selectedTasks, "Priority") === undefined
              ? "Mixed"
              : "Priority"
          }
        />
      </div>
      <div className="w-80">
        <DateRangePicker
          mode="datetime"
          from={sharedValue(selectedTasks, "TimePlannedStart") ?? null}
          to={sharedValue(selectedTasks, "TimePlannedEnd") ?? null}
          hasFromTime={
            sharedValue(selectedTasks, "HasTimePlannedStart") ?? false
          }
          hasToTime={sharedValue(selectedTasks, "HasTimePlannedEnd") ?? false}
          onRangeChange={(s, e, hasFrom, hasTo) =>
            handleBulkUpdate({
              TimePlannedStart: s,
              TimePlannedEnd: e,
              HasTimePlannedStart: hasFrom,
              HasTimePlannedEnd: hasTo,
            })
          }
          placeholder={
            sharedValue(selectedTasks, "TimePlannedStart") === undefined
              ? "Mixed"
              : "Select a date"
          }
        />
      </div>
      <AddRelationshipButton taskIds={selectedIdNumbers} />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More properties">
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 flex flex-col gap-3"
          align="start"
          sideOffset={8}
        >
          <SelectTaskType
            value={sharedType}
            onValueChange={(v) => handleBulkUpdate({ Type: v })}
            placeholder={sharedType === undefined ? "Mixed types" : "Type"}
          />
          <TaskAssignee
            value={sharedValue(selectedTasks, "Assignee") ?? ""}
            onValueChange={(v) => handleBulkUpdate({ Assignee: v })}
            placeholder={
              sharedValue(selectedTasks, "Assignee") === undefined
                ? "Mixed"
                : "Assignee"
            }
          />
        </PopoverContent>
      </Popover>
    </BulkActionsToolbarBase>
  );
}
