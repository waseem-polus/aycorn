import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskTypeIcon from "./TaskTypeIcon";

export function SelectTaskType({ type }: { type: Task["Type"] }) {
  return (
    <Select defaultValue={type}>
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
