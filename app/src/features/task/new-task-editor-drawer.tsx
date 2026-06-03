import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { useTaskMutation } from "@/queries/useTaskMutation";
import TaskEditorDrawer from "./task-editor-drawer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { ChecklistTask } from "@/types/types";

export function NewTaskEditorDrawer({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project, Checklists, Stages } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);

  const handleAddTask = useCallback(
    () =>
      create.mutate(
        {
          ...task,
          Checklist: Checklists[0]?.ID,
          Stage:
            task.Stage !== 0
              ? task.Stage
              : (Stages.find((s) => s.Type === "open")?.ID ??
                Stages[0]?.ID ??
                0),
        },
        {
          onSuccess: (newTask: ChecklistTask) => {
            setTask(newTask);
          },
        },
      ),
    [create, task, Checklists, Stages, setTask],
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
      <Button className="hover:cursor-pointer" onClick={handleAddTask}>
        <Plus />
        New Task
      </Button>
    </TaskEditorDrawer>
  );
}
