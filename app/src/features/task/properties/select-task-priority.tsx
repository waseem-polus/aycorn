import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskPriorityIcon from "./icons/TaskPriorityIcon";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Priority"];
  onValueChange?: (value: Task["Priority"]) => void;
  placeholder?: string;
};

export function SelectTaskPriority({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a priority",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;

  const handleValueChange = (newPriority: Task["Priority"]) => {
    if (isControlled) {
      onValueChange(newPriority);
      return;
    }
    setState({ ...state, Priority: newPriority });
    onChange({ ...state, Priority: newPriority });
  };

  return (
    <Select
      value={isControlled ? value ?? "" : undefined}
      defaultValue={isControlled ? undefined : state.Priority}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id="priority" className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Low">
          <TaskPriorityIcon variant="Low" />
          Low
        </SelectItem>
        <SelectItem value="Medium">
          <TaskPriorityIcon variant="Medium" />
          Medium
        </SelectItem>
        <SelectItem value="High">
          <TaskPriorityIcon variant="High" />
          High
        </SelectItem>
        <SelectItem value="Urgent">
          <TaskPriorityIcon variant="Urgent" />
          Urgent
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
