import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { SelectTaskStatus } from "./taskDrawer/SelectTaskStatus";
import { SelectTaskType } from "./taskDrawer/SelectTaskType";
import { SelectTaskPriority } from "./taskDrawer/SelectTaskPriority";
import { DatePickerInput } from "../DatePickerInput";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableTaskName } from "./taskDrawer/EditableTaskName";
import { SelectChecklist } from "./taskDrawer/SelectChecklist";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useIsMobile } from "@/hooks/useMobile";

export default function TaskSideDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update, deleteTask } = useTaskMutation(Project.ID);

  const handleTaskChanges = (updatedTask: Task) => {
    update.mutate(updatedTask);
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <EditableTaskName onChange={handleTaskChanges} />
          </DrawerTitle>
          <DrawerDescription>
            {"Created "}
            {new Date(task.TimeCreated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            (
            {new Date(task.TimeCreated).toLocaleTimeString("en-US", {
              timeStyle: "short",
            })}
            )
          </DrawerDescription>

          <section className="flex flex-col pt-4 gap-2">
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
                  placeholder="Assignee"
                  className="placeholder:text-neutral-400"
                  onChange={(e) => {
                    setTask({
                      ...task,
                      Assignee: e.target.value,
                    });
                  }}
                  onBlur={(e) =>
                    handleTaskChanges({
                      ...task,
                      Assignee: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </div>

            <div className="flex gap-3">
              <Label htmlFor="name" className="min-w-1/5">
                Checklist
              </Label>
              <SelectChecklist onChange={handleTaskChanges} />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Date
              </Label>
              <DatePickerInput onChange={handleTaskChanges} />
            </div>
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleContent className="flex flex-col gap-2">
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
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <Button
                  variant="link"
                  className="text-xs text-neutral-500 py-1 w-full flex justify-center"
                >
                  {expanded ? <ChevronUp /> : <ChevronDown />}
                  {expanded ? "Hide" : "Show"} 3 fields
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
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
