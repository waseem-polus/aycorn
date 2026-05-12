import { useContext, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ItemTitle } from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useTaskMutation } from "@/queries/useTaskMutation";

export function ListViewTaskName() {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update } = useTaskMutation(Project.ID);
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const isEmpty = task.Name === "";
  const fullName = isEmpty ? "New Task" : task.Name;
  const MAX_DISPLAY_LENGTH = 80;
  const displayName =
    fullName.length > MAX_DISPLAY_LENGTH
      ? `${fullName.slice(0, MAX_DISPLAY_LENGTH)}...`
      : fullName;

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <ItemTitle onClick={(e) => e.stopPropagation()}>
        <h1
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          className="outline-0"
          onBlur={(e) => {
            const text = e.currentTarget.textContent ?? "";
            setIsEditing(false);
            if (text.trim() !== task.Name) {
              const updated = { ...task, Name: text };
              setTask(updated);
              update.mutate(updated);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLHeadingElement).blur();
            }
          }}
        >
          {task.Name}
        </h1>
      </ItemTitle>
    );
  }

  return (
    <ItemTitle className={isEmpty ? "text-neutral-400" : ""}>
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span>{displayName}</span>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="flex w-auto max-w-md items-center gap-2 py-1.5 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm">{fullName}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label="Rename task"
          >
            <Pencil className="size-3.5" />
          </Button>
        </HoverCardContent>
      </HoverCard>
    </ItemTitle>
  );
}
