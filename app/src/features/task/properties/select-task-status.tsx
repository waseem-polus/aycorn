import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskStatusIcon from "./icons/TaskStatusIcon";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Status"];
  onValueChange?: (value: Task["Status"]) => void;
  placeholder?: string;
};

export function SelectTaskStatus({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a status",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;

  const handleValueChange = (newStatus: Task["Status"]) => {
    if (isControlled) {
      onValueChange(newStatus);
      return;
    }
    setState({ ...state, Status: newStatus });
    onChange({ ...state, Status: newStatus });
  };

  return (
    <Select
      value={isControlled ? value ?? "" : undefined}
      defaultValue={isControlled ? undefined : state.Status}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id="status" className="w-full">
        <SelectValue placeholder={placeholder} />
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
  );
}
