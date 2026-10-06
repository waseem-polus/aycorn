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
import { Slot } from "@radix-ui/react-slot";
import { getDefaultChecklistId } from "@/features/checklists/default-checklist";

export function NewTaskEditorDrawer({
  setTaskDrawerOpen,
  stageId,
  children,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
  // Creates the task in this stage instead of the workflow's open stage.
  stageId?: number;
  // Custom trigger; defaults to a "New Task" button.
  children?: React.ReactNode;
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
          Checklist: getDefaultChecklistId(Checklists),
          Stage:
            stageId ??
            Stages.find((s) => s.Type === "open")?.ID ??
            Stages[0]?.ID ??
            0,
        },
        {
          onSuccess: (newTask: ChecklistTask) => {
            setTask(newTask);
          },
        },
      ),
    [create, Checklists, Stages, setTask, stageId],
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
      <Slot onClick={handleAddTask}>
        {children ?? (
          <Button className="hover:cursor-pointer">
            <Plus />
            New Task
          </Button>
        )}
      </Slot>
    </TaskEditorDrawer>
  );
}
