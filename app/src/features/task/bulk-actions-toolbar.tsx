import { useContext } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { SelectTaskStage } from "@/features/stage/select-task-stage";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { SelectChecklist } from "@/features/task/properties/select-checklist";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import { DatePickerInput } from "@/components/DatePickerInput";

type Props = {
  selectedTasks: Task[];
  onClear: () => void;
};

function sharedValue<K extends keyof Task>(
  tasks: Task[],
  key: K,
): Task[K] | undefined {
  if (tasks.length === 0) return undefined;
  const first = tasks[0][key];
  return tasks.every((t) => t[key] === first) ? first : undefined;
}

function pluralize(count: number, word: string) {
  return `${count} ${word}${count !== 1 ? "s" : ""}`;
}

export function BulkActionsToolbar({ selectedTasks, onClear }: Props) {
  const { Project } = useContext(ProjectContext);
  const { bulkUpdate, bulkDelete } = useTaskMutation(Project.ID);

  const count = selectedTasks.length;
  const busy = bulkUpdate.isPending || bulkDelete.isPending;

  const applyChange = (changes: Partial<Task>, label: string) => {
    bulkUpdate.mutate(
      { tasks: selectedTasks, changes },
      {
        onSuccess: (result) => {
          if (result.success === 0) {
            toast(`No tasks needed updating.`);
          } else {
            toast(`Updated ${label} on ${pluralize(result.success, "task")}.`);
          }
        },
        onError: () => toast.error(`Failed updating ${label}.`),
      },
    );
  };

  const handleDelete = () =>
    bulkDelete.mutate(
      selectedTasks.map((t) => t.ID),
      {
        onSuccess: () => {
          toast(`Deleted ${pluralize(count, "task")}.`);
          onClear();
        },
        onError: () => toast.error("Failed deleting tasks."),
      },
    );

  const sharedStage = sharedValue(selectedTasks, "Stage");
  const firstTypeId = selectedTasks[0]?.Type?.ID;
  const sharedType =
    selectedTasks.length > 0 && selectedTasks.every((t) => t.Type?.ID === firstTypeId)
      ? selectedTasks[0].Type
      : undefined;
  const sharedPriority = sharedValue(selectedTasks, "Priority");
  const sharedChecklist = sharedValue(selectedTasks, "Checklist");
  const sharedAssignee = sharedValue(selectedTasks, "Assignee");
  const sharedStart = sharedValue(selectedTasks, "TimePlannedStart");
  const sharedEnd = sharedValue(selectedTasks, "TimePlannedEnd");

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={onClear}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${pluralize(count, "task")}?`,
        description: "This action cannot be undone.",
        busy: bulkDelete.isPending,
      }}
    >
      <div className="w-32">
        <SelectTaskStage
          value={sharedStage}
          onValueChange={(v) => applyChange({ Stage: v }, "stage")}
          placeholder={sharedStage === undefined ? "Mixed" : "Stage"}
        />
      </div>
      <div className="w-32">
        <SelectTaskPriority
          value={sharedPriority}
          onValueChange={(v) => applyChange({ Priority: v }, "priority")}
          placeholder={sharedPriority === undefined ? "Mixed" : "Priority"}
        />
      </div>
      <div className="w-80">
        <DatePickerInput
          start={sharedStart ?? null}
          end={sharedEnd ?? null}
          onRangeChange={(s, e) =>
            applyChange({ TimePlannedStart: s, TimePlannedEnd: e }, "date")
          }
          placeholder={sharedStart === undefined ? "Mixed" : "Select a date"}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="More properties"
            disabled={busy}
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 flex flex-col gap-3"
          align="start"
          sideOffset={8}
        >
          <TaskAssignee
            value={sharedAssignee ?? ""}
            onValueChange={(v) => applyChange({ Assignee: v }, "assignee")}
            placeholder={sharedAssignee === undefined ? "Mixed" : "Assignee"}
          />
          <SelectTaskType
            value={sharedType}
            onValueChange={(v) => applyChange({ Type: v.ID } as unknown as Partial<Task>, "type")}
            placeholder={sharedType === undefined ? "Mixed" : "Type"}
          />
          <SelectChecklist
            value={sharedChecklist}
            onValueChange={(v) => applyChange({ Checklist: v }, "checklist")}
            placeholder={sharedChecklist === undefined ? "Mixed" : "Checklist"}
          />
        </PopoverContent>
      </Popover>
    </BulkActionsToolbarBase>
  );
}
