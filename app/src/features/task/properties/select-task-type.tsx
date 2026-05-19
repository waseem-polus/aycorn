import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskTypeIcon from "./icons/TaskTypeIcon";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Type"];
  onValueChange?: (value: Task["Type"]) => void;
  placeholder?: string;
};

export function SelectTaskType({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a type",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const isControlled = onValueChange !== undefined;

  const handleValueChange = (newType: Task["Type"]) => {
    if (isControlled) {
      onValueChange(newType);
      return;
    }
    setState({ ...state, Type: newType });
    onChange({ ...state, Type: newType });
  };

  return (
    <Select
      value={isControlled ? value ?? "" : undefined}
      defaultValue={isControlled ? undefined : state.Type}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id="type" className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Dev">
          <TaskTypeIcon variant="Dev" />
          Dev
        </SelectItem>
        <SelectItem value="Test">
          <TaskTypeIcon variant="Test" />
          Test
        </SelectItem>
        <SelectItem value="Reminder">
          <TaskTypeIcon variant="Reminder" />
          Reminder
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
