import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRightIcon,
  Package,
  LandPlot,
  Search,
  User,
} from "lucide-react";
import React, { useContext, useMemo, useState } from "react";
import TaskSideDrawer from "@/components/task/TaskSideDrawer";
import TaskStatusIcon from "@/components/task/TaskStatusIcon";
import TaskTypeBadge from "@/components/task/TaskTypeBadge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import TaskPriorityIcon from "../task/TaskPriorityIcon";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { NewTaskSideDrawer } from "../task/NewTaskSideDrawer";

export function TaskTable() {
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
    <div className="flex flex-col gap-4">
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

      <div className="rounded-md border">
        <ItemGroup>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, i) => (
              <React.Fragment key={task.ID}>
                <TaskProvider defaultState={task}>
                  <TaskSideDrawer>
                    <Item asChild>
                      <a>
                        <ItemMedia className="flex flex-col">
                          <TaskStatusIcon variant={task.Status} />
                          <TaskPriorityIcon variant={task.Priority} />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            {task.Name != "" ? task.Name : "Unnamed"}
                          </ItemTitle>

                          <ItemDescription>
                            <span className="w-full flex gap-2">
                              <Badge variant="secondary">
                                <User className="size-2" />
                                {task.Assignee === ""
                                  ? "Unasssigned"
                                  : task.Assignee}
                              </Badge>
                              <Badge variant="secondary">
                                <CalendarIcon className="size-2" />
                                {task.TimePlanned !== null
                                  ? new Date(
                                      task.TimePlanned,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Unscheduled"}
                              </Badge>
                            </span>
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <span className="w-full flex justify-end gap-2">
                            <TaskTypeBadge variant={task.Type} />
                            <Badge variant="outline">
                              <LandPlot className="size-2" />
                              {task.Checklist}
                            </Badge>
                          </span>
                          <ChevronRightIcon className="size-4" />
                        </ItemActions>
                      </a>
                    </Item>
                  </TaskSideDrawer>
                </TaskProvider>

                {filteredTasks.length - 1 != i && <ItemSeparator />}
              </React.Fragment>
            ))
          ) : (
            <Empty>
              <EmptyDescription>No Tasks Found</EmptyDescription>
            </Empty>
          )}
        </ItemGroup>
      </div>
    </div>
  );
}
