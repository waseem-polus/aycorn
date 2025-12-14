import { Page } from "@/components/page/Page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { ProjectDetails } from "@/components/project/ProjectDetails";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: (search.view as string) ?? "table",
    };
  },
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const setView = (newView: string) => navigate({ search: { view: newView } });

  return (
    <ProjectProvider>
      <Page breadcrumb={["Projects"]}>
        <ProjectDetails
          projectId={Number.parseInt(projectId)}
          view={view}
          setView={setView}
        />
      </Page>
    </ProjectProvider>
  );
}
