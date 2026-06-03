import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { Task } from "@/types/types";
import { User } from "lucide-react";
import { useContext, useState } from "react";

type Props = {
  onChange?: (task: Task) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

export function TaskAssignee({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Assignee",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;
  const [localValue, setLocalValue] = useState(value ?? "");
  const [prevPropValue, setPrevPropValue] = useState(value);

  if (isControlled && value !== prevPropValue) {
    setPrevPropValue(value);
    setLocalValue(value ?? "");
  }

  if (isControlled) {
    return (
      <InputGroup>
        <InputGroupAddon>
          <User />
        </InputGroupAddon>
        <InputGroupInput
          id="assignee"
          value={localValue}
          placeholder={placeholder}
          className="placeholder:text-muted-foreground"
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={(e) => {
            if (e.target.value !== (value ?? "")) {
              onValueChange(e.target.value);
            }
          }}
        />
      </InputGroup>
    );
  }

  return (
    <InputGroup>
      <InputGroupAddon>
        <User />
      </InputGroupAddon>
      <InputGroupInput
        id="assignee"
        value={task.Assignee}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground text-sm"
        onChange={(e) => {
          setTask({
            ...task,
            Assignee: e.target.value,
          });
        }}
        onBlur={(e) =>
          onChange({
            ...task,
            Assignee: e.target.value,
          })
        }
      />
    </InputGroup>
  );
}
