import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SelectTaskStatus } from "./SelectTaskStatus";
import { SelectTaskType } from "./SelectTaskType";
import { SelectTaskPriority } from "./SelectTaskPriority";
import { DatePickerInput } from "../DatePickerInput";
import { User } from "lucide-react";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableTaskName } from "./EditableTaskName";
import { SelectChecklist } from "./SelectChecklist";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { Button } from "../ui/button";

export default function TaskSideDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update, deleteTask } = useTaskMutation(Project.ID);

  const handleTaskChanges = (updatedTask: Task) => {
    update.mutate(updatedTask);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <EditableTaskName onChange={handleTaskChanges} />
          </DrawerTitle>
          <section className="flex flex-col py-4 gap-2">
            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Assignee
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput
                  value={task.Assignee}
                  onBlur={(e) =>
                    handleTaskChanges({
                      ...task,
                      Assignee: e.target.value,
                    })
                  }
                  onChange={(e) => {
                    setTask({
                      ...task,
                      Assignee: e.target.value,
                    });
                  }}
                />
              </InputGroup>
            </div>

            <div className="flex gap-3">
              <Label htmlFor="name" className="min-w-1/5">
                Checklist
              </Label>
              <SelectChecklist onChange={handleTaskChanges} />
            </div>

            <br className="my-0.5" />

            <div className="flex flex-row gap-3">
              <Label htmlFor="status" className="min-w-1/5">
                Status
              </Label>
              <SelectTaskStatus onChange={handleTaskChanges} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <SelectTaskType onChange={handleTaskChanges} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="priority" className="min-w-1/5">
                Priority
              </Label>
              <SelectTaskPriority onChange={handleTaskChanges} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Date
              </Label>
              <DatePickerInput onChange={handleTaskChanges} />
            </div>
          </section>
          <Separator />
        </DrawerHeader>
        <DrawerFooter>
          <Button
            variant="destructive"
            onClick={() => {
              deleteTask.mutate(task.ID, {
                onSuccess: () => setOpen(false),
              });
            }}
          >
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
