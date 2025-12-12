import { Page } from "@/components/page/Page";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import type { ProjectDetails } from "@/types/types";
import { TaskTable } from "@/components/project/TaskTable";
import { EditableProjectName } from "@/components/project/EditableProjectName";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: (search.name as string) ?? "",
    };
  },
});

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
        <EditableProjectName
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
        />
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
      <TaskTable projectDetails={projectDetails} />
    </Page>
  );
}
