import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskStatusIcon from "./TaskStatusIcon";

export function SelectTaskStatus({ status }: { status: Task["Status"] }) {
  return (
    <Select defaultValue={status}>
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
