import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { useTaskMutation } from "@/queries/useTaskMutation";
import TaskEditorDrawer from "./task-editor-drawer";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";

export function NewTaskEditorDrawer({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project, Checklists } = useContext(ProjectContext);
  const { create } = useTaskMutation(Project.ID);

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
        className="bg-emerald-500 hover:bg-emerald-500 hover:cursor-pointer"
        onClick={() =>
          create.mutate(
            {
              ...task,
              Checklist: Checklists[0]?.ID,
            },
            {
              onSuccess: (newTask: Task) => {
                setTask(newTask);
              },
            },
          )
        }
      >
        <Plus />
        New Task
      </Button>
    </TaskEditorDrawer>
  );
}
