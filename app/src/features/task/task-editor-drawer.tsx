import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SelectTaskStage } from "@/features/stage/select-task-stage";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { DatePickerInput } from "@/components/DatePickerInput";
import { useContext, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableTaskName } from "@/features/task/header/editable-task-name";
import { SelectChecklist } from "@/features/task/properties/select-checklist";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { useIsMobile } from "@/hooks/useMobile";
import { RichEditor } from "@/features/editor/rich-editor";
import { TaskEditorHeader } from "@/features/task/header/task-editor-header";
import { TaskProperty } from "@/features/task/properties/task-property";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import type { Value } from "platejs";
import { useTaskBodyQuery } from "@/queries/useTaskQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskEditorDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update } = useTaskMutation(Project.ID);

  const handleTaskChanges = (updatedTask: Task) => {
    update.mutate(updatedTask);
  };

  const { isPending, isFetching, data } = useTaskBodyQuery(task.ID, open);
  const handleEditorValueChange = (value: Value) => {
    setTask({ ...task, Body: value });
    handleTaskChanges({ ...task, Body: value });
  };

  return (
    <Drawer
      handleOnly={!isMobile}
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
        setPropertiesOpen(!isMobile || task.ID === 0);
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="min-w-1/2 p-0 overflow-x-visible box-border rounded-lg data-[vaul-drawer-direction=bottom]:h-[calc(100dvh-var(--header-height))] data-[vaul-drawer-direction=bottom]:max-h-dvh">
        <TaskEditorHeader setOpen={setOpen} />
        <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
          <div className="flex items-start gap-1 mx-3 sm:mx-6">
            <EditableTaskName onChange={handleTaskChanges} />
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 self-start mt-6"
              >
                <ChevronDown
                  className={cn(
                    "transition-transform duration-200",
                    propertiesOpen && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <section className="flex flex-col pt-0 px-4 sm:px-8 gap-2 mb-2">
              <TaskProperty label="Checklist" htmlFor="name">
                <SelectChecklist onChange={handleTaskChanges} />
              </TaskProperty>

              <TaskProperty label="Date" htmlFor="date">
                <DatePickerInput onChange={handleTaskChanges} />
              </TaskProperty>

              <TaskProperty label="Assignee" htmlFor="assignee">
                <TaskAssignee onChange={handleTaskChanges} />
              </TaskProperty>

              <TaskProperty label="Stage" htmlFor="stage">
                <SelectTaskStage onChange={handleTaskChanges} />
              </TaskProperty>

              <TaskProperty label="Type" htmlFor="type">
                <SelectTaskType onChange={handleTaskChanges} />
              </TaskProperty>

              <TaskProperty label="Priority" htmlFor="priority">
                <SelectTaskPriority onChange={handleTaskChanges} />
              </TaskProperty>
            </section>
          </CollapsibleContent>
        </Collapsible>

        {open &&
        (task.ID === 0 || (data !== undefined && !isFetching && !isPending)) ? (
          <RichEditor
            key={`${task.ID}-${open}`}
            onDebounceChange={handleEditorValueChange}
            debounceDuration={250}
            initialValue={data === "" ? [] : data}
          />
        ) : (
          <div className="flex h-full w-full flex-col gap-2 py-4 px-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
