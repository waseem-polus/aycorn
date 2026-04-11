import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { Task } from "@/types/types";
import { User } from "lucide-react";
import { useContext } from "react";

export function TaskAssignee({
  onChange = () => {},
}: {
  onChange?: (task: Task) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);

  return (
    <InputGroup>
      <InputGroupAddon>
        <User />
      </InputGroupAddon>
      <InputGroupInput
        id="assignee"
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
          onChange({
            ...task,
            Assignee: e.target.value,
          })
        }
      />
    </InputGroup>
  );
}
