import {
  Drawer,
  DrawerContent,
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
import { useContext, useEffect, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableTaskName } from "./EditableTaskName";
import { SelectChecklist } from "./SelectChecklist";

export default function TaskSideDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const [pendingChanges, setPendingChanges] = useState(false);

  const handleTaskChanges = () => {
    setPendingChanges(true);
  };

  useEffect(() => {
    if (pendingChanges) {
      const method = task.ID > 0 ? "PUT" : "POST";
      fetch("http://localhost:8000/api/task", {
        method,
        body: JSON.stringify(task),
      })
        .then((res) => res.json())
        .then((success) => setPendingChanges(!success));
    }
  }, [task, pendingChanges]);

  return (
    <Drawer direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div></div>
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
                  onBlur={handleTaskChanges}
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
              <SelectChecklist />
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
      </DrawerContent>
    </Drawer>
  );
}
