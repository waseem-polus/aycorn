import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/types";

export function EditableTaskName({
  onChange = () => {},
  className = "",
}: {
  onChange?: (task: Task) => void;
  className?: string;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);

  return (
    <div className="grow flex flex-col text-wrap mb-2">
      <h1
        contentEditable
        suppressContentEditableWarning
        data-placeholder="New Task..."
        className={cn(
          "ce-placeholder not-focus:hover:bg-accent dark:not-focus:hover:bg-accent/50 outline-0 p-1 border border-transparent font-normal text-2xl md:text-2xl text-wrap min-h-8 leading-tight focus:outline-none focus:border-b-input",
          className,
        )}
        onBlur={(e) => {
          const text = e.currentTarget.textContent ?? "";
          if (text.trim() !== task.Name) {
            setTask({ ...task, Name: text });
            onChange({ ...task, Name: text });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        {task.Name}
      </h1>
    </div>
  );
}
