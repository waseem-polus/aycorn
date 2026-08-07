import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { useTaskMutation } from "@/queries/useTaskMutation";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { ChecklistTask } from "@/types/types";
import { useDateFormat } from "@/hooks/useDateFormatter";

export function NewTaskEditorDrawer({
  date,
  startTime,
  setTaskDrawerOpen,
}: {
  date: Date;
  startTime: { hour: number; minute: number };
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { setState: setTask } = useContext(TaskContext);
  const { Project, Checklists } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);

  const { toISO } = useDateFormat();
  // Always build from the defaults, never from whatever the (long-lived)
  // context happens to hold — a leftover value would be baked into the new task.
  const handleAddTask = useCallback(() => {
    const startDateTime = new Date(date);
    startDateTime.setHours(startTime.hour, startTime.minute);

    const endDateTime = new Date(date);
    endDateTime.setHours(startTime.hour, startTime.minute + 30);

    create.mutate(
      {
        ...defaultTaskContextValue.state,
        Checklist: Checklists[0]?.ID,
        TimePlannedStart: toISO(startDateTime),
        TimePlannedEnd: toISO(endDateTime),
      },
      {
        onSuccess: (newTask: ChecklistTask) => {
          setTask(newTask);
        },
      },
    );
  }, [create, Checklists, setTask, toISO, date, startTime]);

  return (
    <TaskEditorDrawer
      onOpenChange={(open) => {
        setTaskDrawerOpen(open);
        if (!open) {
          setTask(defaultTaskContextValue.state);
        }
      }}
    >
      <div
        onClick={handleAddTask}
        className="absolute inset-0 cursor-pointer transition-colors hover:bg-secondary"
      />
    </TaskEditorDrawer>
  );
}
