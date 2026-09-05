import { createFileRoute } from "@tanstack/react-router";
import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { TaskPage } from "@/features/task/task-page/task-page";
import { useTaskQuery } from "@/queries/useTaskQuery";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/task/$taskId")({
  component: RouteComponent,
});

function TaskPageHeader({ projectId }: { projectId: number }) {
  const { Project } = useContext(ProjectContext);
  const { state: task } = useContext(TaskContext);

  return (
    <PageHeader
      breadcrumb={[
        { label: "Projects", to: "/" },
        {
          label: Project.Name || "Project",
          to: "/project/$projectId",
          params: { projectId: String(projectId) },
        },
        task.Name || "Task",
      ]}
    />
  );
}

function RouteComponent() {
  const { taskId } = Route.useParams();
  const { data: task, isPending } = useTaskQuery(Number(taskId));

  if (isPending || !task) {
    return (
      <Page>
        <PageHeader breadcrumb={[{ label: "Projects", to: "/" }, "Loading..."]} />
        <PageContent>
          <div className="flex flex-col gap-4 max-w-4xl w-full">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </PageContent>
      </Page>
    );
  }

  return (
    <ProjectProvider>
      {/*
        TaskProvider seeds its state once, so a task that moves to another
        project would keep pointing at the old project's stage and checklist.
        Keying on the project remounts it with the refetched task.
      */}
      <TaskProvider key={task.ProjectID} defaultState={task}>
        <Page>
          <TaskPageHeader projectId={task.ProjectID} />
          <PageContent>
            <TaskPage projectId={task.ProjectID} />
          </PageContent>
        </Page>
      </TaskProvider>
    </ProjectProvider>
  );
}
