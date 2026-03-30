import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SelectTaskStatus } from "./taskDrawer/SelectTaskStatus";
import { SelectTaskType } from "./taskDrawer/SelectTaskType";
import { SelectTaskPriority } from "./taskDrawer/SelectTaskPriority";
import { DatePickerInput } from "../DatePickerInput";
import {
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Maximize2,
  User,
} from "lucide-react";
import { useContext, useState } from "react";
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
import { useDateFormat } from "@/hooks/useDateFormatter";
import { PlateEditor } from "../../features/editor/plate-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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

  const { toFormatted } = useDateFormat();

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
      <DrawerContent className="min-w-1/2 p-0 overflow-x-visible">
        <DrawerHeader className="p-2 ">
          <div className="flex justify-end">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
              >
                <Maximize2 className="size-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 data-[state=open]:bg-muted text-muted-foreground flex"
                  >
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-2">
                  <DropdownMenuGroup>
                    <DrawerClose asChild>
                      <DropdownMenuItem>Close</DropdownMenuItem>
                    </DrawerClose>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        deleteTask.mutate(task.ID, {
                          onSuccess: () => setOpen(false),
                        });
                      }}
                      variant="destructive"
                    >
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DrawerHeader>

        <EditableTaskName
          className="mx-6 pb-2 mb-2"
          onChange={handleTaskChanges}
        />
        <section className="flex flex-col pt-0 px-8 gap-2">
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
                Show
                {expanded ? " less " : " more "}
                fields
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </section>

        <PlateEditor />

        <DrawerFooter className="p-2">
          <span className="flex justify-end text-sm text-muted-foreground">
            {"Created "}
            {toFormatted(task.TimeCreated)} (
            {new Date(task.TimeCreated).toLocaleTimeString("en-US", {
              timeStyle: "short",
            })}
            )
          </span>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
