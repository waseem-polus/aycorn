import type { Checklist, Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext, useEffect, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function SelectChecklist() {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { state: project } = useContext(ProjectContext);

  const [projectChecklists, setProjectChecklists] = useState<Checklist[]>([]);
  useEffect(() => {
    fetch(`http://localhost:8000/api/project/checklist/${project.ID}`)
      .then((res) => res.json())
      .then((res: Checklist[]) => setProjectChecklists(res));
  }, [project]);

  const handleValueChange = (newType: Task["Type"]) => {
    setTask({ ...task, Checklist: Number.parseInt(newType) });
  };

  return (
    <Select defaultValue={task.Type} onValueChange={handleValueChange}>
      <SelectTrigger id="type" className="w-full">
        <SelectValue placeholder="Select a checklist" />
      </SelectTrigger>
      <SelectContent>
        {projectChecklists.map((checklist) => (
          <SelectItem value={checklist.ID.toString()} key={checklist.ID}>
            {checklist.Name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
