import { Page } from "@/components/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Calendar } from "@/components/ui/calendar";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRightIcon,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleMinus,
  Package,
  LandPlot,
  Search,
  User,
  Bug,
  Bell,
  Bot,
  Calendar1,
  Circle,
  Plus,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconDotsVertical } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: (search.name as string) ?? "",
    };
  },
});

export type Project = {
  ID: number;
  Name: string;
  Pinned: boolean;
};

type Task = {
  ID: number;
  Name: string;
  TimeCompleted: string | null;
  TimeStarted: string | null;
  TimePlanned: string | null;
  Assignee: string;
  Priority: "Urgent" | "High" | "Medium" | "Low";
  Type: "Test" | "Dev" | "Reminder";
  Status: "Open" | "Todo" | "Doing" | "Blocked" | "Done";
};

type ProjectDetails = {
  Project: Project;
  Tasks: (Task & {
    Checklist: number;
    ChecklistName: string;
  })[];
};

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { name } = Route.useSearch();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    Project: {
      ID: Number.parseInt(projectId),
      Name: name,
      Pinned: false,
    },
    Tasks: [
      {
        ID: 0,
        Name: "",
        TimePlanned: null,
        TimeCompleted: null,
        TimeStarted: null,
        Assignee: "",
        Priority: "Medium",
        Type: "Dev",
        Checklist: 0,
        Status: "Open",
        ChecklistName: "",
      },
    ],
  });

  const [search, setSearch] = useState("");
  const filteredTasks = useMemo(
    () =>
      projectDetails.Tasks.filter((task) => {
        return task.Name.toLowerCase().includes(search.toLowerCase());
      }),
    [search, projectDetails],
  );

  const [editingProjectName, setEditingProjectName] = useState(false);
  const [draftProjectName, setDraftProjectName] = useState(
    projectDetails.Project.Name,
  );

  useEffect(() => {
    fetch(`http://localhost:8000/api/project/${projectId}`)
      .then((res) => res.json())
      .then((res: ProjectDetails) => {
        setProjectDetails(res);
      });
  }, [projectId]);

  return (
    <Page breadcrumb={["Projects", name]}>
      <div className="flex justify-between">
        <div className="grow flex flex-col text-wrap">
          {!editingProjectName ? (
            <h1
              className="text-2xl py-1 px-3 hover:bg-neutral-50 rounded-md "
              onClick={() => setEditingProjectName(true)}
            >
              {projectDetails.Project.Name}
            </h1>
          ) : (
            <Input
              value={draftProjectName}
              placeholder="Project Name"
              className="text-2xl md:text-2xl"
              autoFocus
              minLength={1}
              onChange={(e) => {
                setDraftProjectName(e.target.value);
              }}
              onBlur={() => {
                setEditingProjectName(false);
                setProjectDetails({
                  ...projectDetails,
                  Project: {
                    ...projectDetails.Project,
                    Name: draftProjectName,
                  },
                });
                fetch(
                  `http://localhost:8000/api/project/${projectDetails.Project.ID}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(projectDetails.Project),
                  },
                );
              }}
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Pin</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
          <Button className="bg-emerald-500 hover:bg-emerald-500 hover:cursor-pointer">
            <Plus />
            New Task
          </Button>
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
                  <TaskSideDrawer task={task}>
                    <Item asChild>
                      <a>
                        <TaskStatusIcon variant={task.Status} />
                        <ItemContent>
                          <ItemTitle>{task.Name}</ItemTitle>

                          <ItemDescription>
                            <span className="w-full flex gap-2">
                              <Badge variant="secondary">
                                <User className="size-2" />
                                {task.Assignee}
                              </Badge>
                              <Popover>
                                <PopoverTrigger
                                  asChild
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer"
                                  >
                                    <CalendarIcon className="size-2" />
                                    {task.TimePlanned ?? "Unscheduled"}
                                  </Badge>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto overflow-hidden p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    className="rounded-md border shadow-sm"
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                            </span>
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <span className="w-full flex justify-end gap-2">
                            <TaskTypeBadge variant={task.Type} />
                            <Badge variant="secondary">
                              <LandPlot className="size-2" />
                              {task.Checklist}
                            </Badge>
                          </span>
                          <ChevronRightIcon className="size-4" />
                        </ItemActions>
                      </a>
                    </Item>
                  </TaskSideDrawer>

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
    </Page>
  );
}

function TaskStatusIcon({ variant }: { variant: Task["Status"] }) {
  let icon = <CircleDashed className="size-4" />;
  switch (variant) {
    case "Open":
      break;
    case "Todo":
      icon = <Circle className="size-4 stroke-orange-400" />;
      break;
    case "Doing":
      icon = <CircleDot className="size-4 stroke-green-500" />;
      break;
    case "Blocked":
      icon = <CircleMinus className="size-4 stroke-red-700" />;
      break;
    case "Done":
      icon = <CircleCheck className="size-4 stroke-purple-600" />;
      break;
  }

  return <ItemMedia>{icon}</ItemMedia>;
}

function TaskTypeIcon({ variant }: { variant: Task["Type"] }) {
  let icon = <Bot className="size-4 stroke-green-500" />;
  switch (variant) {
    case "Dev":
      break;
    case "Test":
      icon = <Bug className="size-4 stroke-blue-500" />;
      break;
    case "Reminder":
      icon = <Bell className="size-4 stroke-orange-400" />;
      break;
  }

  return icon;
}

function TaskTypeBadge({ variant }: { variant: Task["Type"] }) {
  let color = "bg-green-100";
  switch (variant) {
    case "Dev":
      break;
    case "Test":
      color = "bg-blue-100";
      break;
    case "Reminder":
      color = "bg-orange-100";
      break;
  }

  return (
    <Badge variant="secondary" className={color}>
      <TaskTypeIcon variant={variant} />
      {variant}
    </Badge>
  );
}

function TaskSideDrawer({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  return (
    <Drawer direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{task.Name}</DrawerTitle>
          <section className="flex flex-col py-4 gap-2">
            <div className="flex flex-row gap-3">
              <Label htmlFor="status" className="min-w-1/5">
                Status
              </Label>
              <Select defaultValue={task.Status}>
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
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <Select defaultValue={task.Type}>
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
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Assignee
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput value={task.Assignee} />
              </InputGroup>
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Planned For
              </Label>
              <Popover>
                <PopoverTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Button
                    variant="outline"
                    className="grow flex justify-start text-sm font-normal"
                  >
                    <Calendar1 className="size-4 stroke-accent-foreground" />
                    {task.TimePlanned ?? "Unscheduled"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </section>
          <Separator />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
