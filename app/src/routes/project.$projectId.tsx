import { Page } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { ProjectDetails } from "@/components/project/ProjectDetails";

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

  return (
    <ProjectProvider>
      <Page breadcrumb={["Projects"]}>
        <ProjectDetails projectId={Number.parseInt(projectId)} />
      </Page>
    </ProjectProvider>
  );
}
