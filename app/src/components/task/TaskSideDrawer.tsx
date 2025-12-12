import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Task } from "@/types/types";
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

export default function TaskSideDrawer({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  return (
    <Drawer direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{task.Name}</DrawerTitle>
          <section className="flex flex-col py-4 gap-2">
            <div className="flex flex-row gap-3">
              <Label htmlFor="status" className="min-w-1/5">
                Status
              </Label>
              <SelectTaskStatus status={task.Status} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <SelectTaskType type={task.Type} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="priority" className="min-w-1/5">
                Type
              </Label>
              <SelectTaskPriority priority={task.Priority} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Assignee
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput value={task.Assignee} />
              </InputGroup>
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Planned For
              </Label>
              <DatePickerInput />
            </div>
          </section>
          <Separator />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
