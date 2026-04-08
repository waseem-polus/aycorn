import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SelectTaskStatus } from "@/features/task/properties/select-task-status";
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
import { useDateFormat } from "@/hooks/useDateFormatter";
import { RichEditor } from "@/features/editor/rich-editor";
import { TaskEditorHeader } from "@/features/task/header/task-editor-header";
import { TaskProperty } from "@/features/task/properties/task-property";
import { CollapsibleSection } from "@/features/task/properties/collapsible-section";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import type { Value } from "platejs";
import { useTaskBodyQuery } from "@/queries/useTaskQuery";

export default function TaskEditorDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update } = useTaskMutation(Project.ID);

  const { toFormatted } = useDateFormat();

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
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="min-w-1/2 p-0 overflow-x-visible box-border rounded-lg">
        <TaskEditorHeader setOpen={setOpen} />
        <EditableTaskName
          className="mx-6 pb-2 mb-2"
          onChange={handleTaskChanges}
        />
        <section className="flex flex-col pt-0 px-8 gap-2 mb-2">
          <TaskProperty label="Checklist" htmlFor="name">
            <SelectChecklist onChange={handleTaskChanges} />
          </TaskProperty>

          <TaskProperty label="Date" htmlFor="date">
            <DatePickerInput onChange={handleTaskChanges} />
          </TaskProperty>

          <CollapsibleSection>
            <TaskProperty label="Assignee" htmlFor="assignee">
              <TaskAssignee onChange={handleTaskChanges} />
            </TaskProperty>

            <TaskProperty label="Status" htmlFor="status">
              <SelectTaskStatus onChange={handleTaskChanges} />
            </TaskProperty>

            <TaskProperty label="Type" htmlFor="type">
              <SelectTaskType onChange={handleTaskChanges} />
            </TaskProperty>

            <TaskProperty label="Priority" htmlFor="priority">
              <SelectTaskPriority onChange={handleTaskChanges} />
            </TaskProperty>
          </CollapsibleSection>
        </section>

        {open && (task.ID === 0 || (data && !isFetching && !isPending)) ? (
          <RichEditor
            key={`${task.ID}-${open}`}
            onDebounceChange={handleEditorValueChange}
            debounceDuration={250}
            initialValue={data}
          />
        ) : (
          <p>Loading body...</p>
        )}

        <DrawerFooter className="p-2 border-t">
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
