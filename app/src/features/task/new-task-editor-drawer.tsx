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
  const { setState: setTask } = useContext(TaskContext);
  const { Project, Checklists, Stages } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);

  // Always build from the defaults, never from whatever the (long-lived)
  // context happens to hold — a leftover value would be baked into the new task.
  const handleAddTask = useCallback(
    () =>
      create.mutate(
        {
          ...defaultTaskContextValue.state,
          Checklist: Checklists[0]?.ID,
          Stage:
            Stages.find((s) => s.Type === "open")?.ID ?? Stages[0]?.ID ?? 0,
        },
        {
          onSuccess: (newTask: ChecklistTask) => {
            setTask(newTask);
          },
        },
      ),
    [create, Checklists, Stages, setTask],
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
