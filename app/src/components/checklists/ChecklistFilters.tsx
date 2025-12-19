import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { NewTaskSideDrawer } from "../task/NewTaskSideDrawer";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "../ui/button";

export function ChecklistFilters() {
  const { Project, Tasks, SetFilter, Filter } = useContext(ProjectContext);

  return (
    <div className="flex gap-2">
      <InputGroup>
        <InputGroupInput
          placeholder="Filter Checklists..."
          onChange={(e) => SetFilter({ ...Filter, Name: e.target.value ?? "" })}
          value={Filter.Name}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {Tasks.length ?? 0} tasks
        </InputGroupAddon>
      </InputGroup>
      <Button className="bg-emerald-500 hover:bg-emerald-500 hover:cursor-pointer">
        <Plus />
        New Task
      </Button>
    </div>
  );
}
