import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { LandPlot, Search } from "lucide-react";
import { NewTaskSideDrawer } from "../task/NewTaskSideDrawer";
import { Button } from "../ui/button";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ChecklistFilter } from "./taskFilters/ChecklistFilter";
import { StatusFilter } from "./taskFilters/StatusFilter";
import { PriorityFilter } from "./taskFilters/PriorityFilter";
import { TypeFilter } from "./taskFilters/StatusFilter copy";
import { Link } from "@tanstack/react-router";

export function TaskFilters({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Project, Tasks, SetFilter, Filter } = useContext(ProjectContext);

  return (
    <>
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Filter Tasks..."
            onChange={(e) =>
              SetFilter({ ...Filter, Name: e.target.value ?? "" })
            }
            value={Filter.Name}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {Tasks.length ?? 0} tasks
          </InputGroupAddon>
        </InputGroup>
        <Link
          to="/project/checklists/$projectId"
          params={{ projectId: Project.ID.toString() }}
        >
          <Button variant="outline">
            <LandPlot />
            Checklists
          </Button>
        </Link>
        <TaskProvider>
          <NewTaskSideDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
        </TaskProvider>
      </div>

      <div className="flex flex-row gap-2">
        <ChecklistFilter />
        <StatusFilter />
        <PriorityFilter />
        <TypeFilter />
      </div>
    </>
  );
}
