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

export function SelectTaskType({
  onChange = () => {},
}: {
  onChange?: (task: Task) => void;
}) {
  const { state, setState } = useContext(TaskContext);
  const handleValueChange = (newType: Task["Type"]) => {
    setState({ ...state, Type: newType });
    onChange({ ...state, Type: newType });
  };

  return (
    <Select defaultValue={state.Type} onValueChange={handleValueChange}>
      <SelectTrigger id="type" className="w-full">
        <SelectValue placeholder="Select a type" />
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
