import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskStatusIcon from "./TaskStatusIcon";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";

export function SelectTaskStatus({
  onChange = () => {},
}: {
  onChange?: (task: Task) => void;
}) {
  const { state, setState } = useContext(TaskContext);
  const handleValueChange = (newStatus: Task["Status"]) => {
    setState({ ...state, Status: newStatus });
    onChange({ ...state, Status: newStatus });
  };

  return (
    <Select defaultValue={state.Status} onValueChange={handleValueChange}>
      <SelectTrigger id="status" className="w-full">
        <SelectValue placeholder="Select a status" />
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
