import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { ChevronDown, LandPlot, Package, Search, User } from "lucide-react";
import { NewTaskSideDrawer } from "../task/NewTaskSideDrawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useContext, useMemo, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function TaskFilters() {
  const { Tasks } = useContext(ProjectContext);
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(
    () =>
      Tasks.filter((task) => {
        return task.Name.toLowerCase().includes(search.toLowerCase());
      }),
    [search, Tasks],
  );

  return (
    <>
      <div className="flex gap-4">
        <InputGroup>
          <InputGroupInput
            placeholder="Filter Tasks..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filteredTasks.length ?? 0} tasks
          </InputGroupAddon>
        </InputGroup>
        <TaskProvider>
          <NewTaskSideDrawer />
        </TaskProvider>
      </div>

      <div className="flex flex-row gap-2">
        <DropdownMenu>
          {/* TODO: Use  combobox here */}
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <LandPlot className="size-4" /> Checklists <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem>
              Some project with a lot of time next to it too
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 2</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 3</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          {/* TODO: Use  combobox here */}
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Package className="size-4" /> Type <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem>
              Some project with a lot of time next to it too
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 2</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 3</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          {/* TODO: Use  combobox here */}
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <User className="size-4" /> Assignee <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem>
              Some project with a lot of time next to it too
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 2</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Checklist 3</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
