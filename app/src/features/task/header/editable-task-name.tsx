import { forwardRef, useContext, useImperativeHandle, useRef } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableHeader } from "@/components/EditableHeader";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/types";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type EditableTaskNameHandle = {
  // Persist whatever is currently in the DOM. Blur is not a reliable commit
  // point — when the drawer is dismissed straight from the focused title, blur
  // fires *after* the close handler has already reset the task context.
  commit: () => void;
};

export const EditableTaskName = forwardRef<
  EditableTaskNameHandle,
  { onChange?: (task: Task) => void; className?: string }
>(function EditableTaskName({ onChange = () => {}, className = "" }, forwardedRef) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const saveName = (value: string) => {
    const name = value.trim();
    if (name === task.Name) return;
    setTask({ ...task, Name: name });
    onChange({ ...task, Name: name });
  };

  useImperativeHandle(forwardedRef, () => ({
    commit: () => saveName(headingRef.current?.textContent ?? ""),
  }));

  return (
    <div className="grow flex items-start flex-row gap-1 text-wrap mb-2">
      <Tooltip>
        <TooltipTrigger className="hidden sm:flex">
          <TaskPriorityIcon variant={task.Priority} className="size-6 mt-2 shrink" />
        </TooltipTrigger>
        <TooltipContent>{task.Priority} Priority</TooltipContent>
      </Tooltip>
      <EditableHeader
        ref={headingRef}
        value={task.Name}
        setValue={saveName}
        placeholder="Untitled Task..."
        className={cn(
          "rounded not-focus:hover:no-underline p-1 md:text-2xl min-h-8 focus:border-b-input flex-1",
          className,
        )}
      />
    </div>
  );
});
