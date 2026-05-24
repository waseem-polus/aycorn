import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { useTaskMutation } from "@/queries/useTaskMutation";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { ChecklistTask } from "@/types/types";
import { useDateFormat } from "@/hooks/useDateFormatter";

export function NewTaskEditorDrawer({
  date,
  setTaskDrawerOpen,
}: {
  date: Date;
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project, Checklists } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);

  const { toISO } = useDateFormat();
  const handleAddTask = useCallback(
    () =>
      create.mutate(
        {
          ...task,
          Checklist: Checklists[0]?.ID,
          TimePlannedStart: toISO(date),
        },
        {
          onSuccess: (newTask: ChecklistTask) => {
            setTask(newTask);
          },
        },
      ),
    [create, task, Checklists, setTask, toISO, date],
  );

  return (
    <TaskEditorDrawer
      onOpenChange={(open) => {
        setTaskDrawerOpen(open);
        if (!open) {
          setTask(defaultTaskContextValue.state);
        }
      }}
    >
      <Button
        variant="ghost"
        className="border h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
        size="icon-sm"
        onClick={handleAddTask}
      >
        <Plus className="size-4" />
      </Button>
    </TaskEditorDrawer>
  );
}
