import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskPriorityIcon from "./TaskPriorityIcon";

export function SelectTaskPriority({
  priority,
}: {
  priority: Task["Priority"];
}) {
  return (
    <Select defaultValue={priority}>
      <SelectTrigger id="priority" className="w-full">
        <SelectValue placeholder="Select a priority" />
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
