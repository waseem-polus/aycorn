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
import { LandPlotIcon } from "lucide-react";

type Props = {
  onChange?: (task: Task) => void;
  value?: number;
  onValueChange?: (value: number) => void;
  placeholder?: string;
};

export function SelectChecklist({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a checklist",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Checklists: checklists } = useContext(ProjectContext);
  const isControlled = onValueChange !== undefined;

  const handleValueChange = (newId: string) => {
    const parsed = Number.parseInt(newId);
    if (isControlled) {
      onValueChange(parsed);
      return;
    }
    setTask({ ...task, Checklist: parsed });
    onChange({ ...task, Checklist: parsed });
  };

  const controlledValue =
    isControlled && value !== undefined ? value.toString() : "";

  return (
    <Select
      value={isControlled ? controlledValue : undefined}
      defaultValue={isControlled ? undefined : task.Checklist.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id="checklist" className="w-full">
        <div className="flex gap-2">
          <LandPlotIcon />
          <SelectValue placeholder={placeholder} />
        </div>
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
