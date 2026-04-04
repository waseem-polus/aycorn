import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function SelectChecklist({
  onChange,
}: {
  onChange: (task: Task) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Checklists: checklists } = useContext(ProjectContext);

  const handleValueChange = (newType: Task["Type"]) => {
    setTask({ ...task, Checklist: Number.parseInt(newType) });
    onChange({ ...task, Checklist: Number.parseInt(newType) });
  };

  return (
    <Select
      defaultValue={task.Checklist.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id="checklist" className="w-full">
        <SelectValue placeholder="Select a checklist" />
      </SelectTrigger>
      <SelectContent>
        {checklists.map((checklist) => (
          <SelectItem value={checklist.ID.toString()} key={checklist.ID}>
            {checklist.Name !== "" ? checklist.Name : "New Checklist"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
