import { useContext, useState } from "react";
import { MoreHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { SelectTaskStatus } from "@/features/task/properties/select-task-status";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { SelectChecklist } from "@/features/task/properties/select-checklist";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import { DatePickerInput } from "@/components/DatePickerInput";
import { TaskProperty } from "@/features/task/properties/task-property";
import { cn } from "@/lib/utils";

type Props = {
  selectedTasks: Task[];
  onClear: () => void;
  className?: string;
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

export function BulkActionsToolbar({
  selectedTasks,
  onClear,
  className,
}: Props) {
  const { Project } = useContext(ProjectContext);
  const { bulkUpdate, bulkDelete } = useTaskMutation(Project.ID);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const count = selectedTasks.length;
  const busy = bulkUpdate.isPending || bulkDelete.isPending;

  const applyChange = (changes: Partial<Task>, label: string) => {
    bulkUpdate.mutate(
      { tasks: selectedTasks, changes },
      {
        onSuccess: (updatedCount) => {
          if (updatedCount === 0) {
            toast(`No tasks needed updating.`);
          } else {
            toast(`Updated ${label} on ${pluralize(updatedCount, "task")}.`);
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
          setDeleteOpen(false);
          onClear();
        },
        onError: () => toast.error("Failed deleting tasks."),
      },
    );

  const sharedStatus = sharedValue(selectedTasks, "Status");
  const sharedType = sharedValue(selectedTasks, "Type");
  const sharedPriority = sharedValue(selectedTasks, "Priority");
  const sharedChecklist = sharedValue(selectedTasks, "Checklist");
  const sharedAssignee = sharedValue(selectedTasks, "Assignee");
  const sharedStart = sharedValue(selectedTasks, "TimePlannedStart");
  const sharedEnd = sharedValue(selectedTasks, "TimePlannedEnd");

  return (
    <motion.div
      data-keep-selection=""
      initial={{ opacity: 0, x: "-50%", y: 120 }}
      animate={{ opacity: 1, x: "-50%", y: 0 }}
      exit={{ opacity: 0, x: "-50%", y: 120 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "fixed bottom-16 left-1/2 z-50 flex items-stretch gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-lg max-w-[calc(100vw-2rem)]",
        className,
      )}
    >
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-medium px-2 whitespace-nowrap min-w-40">
          {pluralize(count, "task")} selected
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X />
        </Button>
      </div>

      <Separator orientation="vertical" className="!h-auto shrink-0" />

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-32">
          <SelectTaskStatus
            value={sharedStatus}
            onValueChange={(v) => applyChange({ Status: v }, "status")}
            placeholder={sharedStatus === undefined ? "Mixed" : "Status"}
          />
        </div>
        <div className="w-32">
          <SelectTaskPriority
            value={sharedPriority}
            onValueChange={(v) => applyChange({ Priority: v }, "priority")}
            placeholder={sharedPriority === undefined ? "Mixed" : "Priority"}
          />
        </div>
        <div className="w-40">
          <TaskAssignee
            value={sharedAssignee ?? ""}
            onValueChange={(v) => applyChange({ Assignee: v }, "assignee")}
            placeholder={sharedAssignee === undefined ? "Mixed" : "Assignee"}
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
            <Button variant="ghost" size="icon-sm" aria-label="More properties">
              <MoreHorizontal />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 flex flex-col gap-3"
            align="end"
            sideOffset={8}
          >
            <TaskProperty label="Type" htmlFor="type">
              <SelectTaskType
                value={sharedType}
                onValueChange={(v) => applyChange({ Type: v }, "type")}
                placeholder={sharedType === undefined ? "Mixed" : "Type"}
              />
            </TaskProperty>
            <TaskProperty label="Checklist" htmlFor="checklist">
              <SelectChecklist
                value={sharedChecklist}
                onValueChange={(v) =>
                  applyChange({ Checklist: v }, "checklist")
                }
                placeholder={
                  sharedChecklist === undefined ? "Mixed" : "Checklist"
                }
              />
            </TaskProperty>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" className="!h-auto shrink-0" />

      <div className="flex items-center shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={busy}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
          Delete
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pluralize(count, "task")}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={bulkDelete.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
