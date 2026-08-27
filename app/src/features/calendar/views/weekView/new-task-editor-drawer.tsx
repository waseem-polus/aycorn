import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { toApiDate } from "@/utils/date";
import { useTaskMutation } from "@/queries/useTaskMutation";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { ChecklistTask } from "@/types/types";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";

export function NewTaskEditorDrawer({
  date,
  startTime,
}: {
  date: Date;
  startTime: { hour: number; minute: number };
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project, Checklists } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);
  const { onCreateDrawerOpenChange } = useCalendarHost();

  const handleAddTask = useCallback(() => {
    const startDateTime = new Date(date);
    startDateTime.setHours(startTime.hour, startTime.minute);

    const endDateTime = new Date(date);
    endDateTime.setHours(startTime.hour, startTime.minute + 30);

    create.mutate(
      {
        ...task,
        Checklist: Checklists[0]?.ID,
        TimePlannedStart: toApiDate(startDateTime),
        TimePlannedEnd: toApiDate(endDateTime),
      },
      {
        onSuccess: (newTask: ChecklistTask) => {
          setTask(newTask);
        },
      },
    );
  }, [create, task, Checklists, setTask, date, startTime]);

  return (
    <TaskEditorDrawer
      onOpenChange={(open) => {
        onCreateDrawerOpenChange?.(open);
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
