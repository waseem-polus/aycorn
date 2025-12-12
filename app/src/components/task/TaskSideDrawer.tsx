import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Task } from "@/types/types";
import TaskStatusIcon from "./TaskStatusIcon";
import TaskTypeIcon from "./TaskTypeIcon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Calendar1, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";

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
              <Select defaultValue={task.Status}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">
                    <TaskStatusIcon variant="Open" />
                    Open
                  </SelectItem>
                  <SelectItem value="Todo">
                    <TaskStatusIcon variant="Todo" />
                    Todo
                  </SelectItem>
                  <SelectItem value="Doing">
                    <TaskStatusIcon variant="Doing" />
                    Doing
                  </SelectItem>
                  <SelectItem value="Blocked">
                    <TaskStatusIcon variant="Blocked" />
                    Blocked
                  </SelectItem>
                  <SelectItem value="Done">
                    <TaskStatusIcon variant="Done" />
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <Select defaultValue={task.Type}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dev">
                    <TaskTypeIcon variant="Dev" />
                    Dev
                  </SelectItem>
                  <SelectItem value="Test">
                    <TaskTypeIcon variant="Test" />
                    Test
                  </SelectItem>
                  <SelectItem value="Reminder">
                    <TaskTypeIcon variant="Reminder" />
                    Reminder
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Popover>
                <PopoverTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Button
                    variant="outline"
                    className="grow flex justify-start text-sm font-normal"
                  >
                    <Calendar1 className="size-4 stroke-accent-foreground" />
                    {task.TimePlanned ?? "Unscheduled"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </section>
          <Separator />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
