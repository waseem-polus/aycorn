import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { ProjectDetails } from "@/components/project/project";
import { ProjectHeader } from "@/components/project/project-header";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { view?: string } => {
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
      <Page>
        <PageHeader breadcrumb={["Projects"]}>
          <ProjectHeader />
        </PageHeader>
        <PageContent>
          <ProjectDetails
            projectId={Number.parseInt(projectId)}
            view={view ?? "table"}
            setView={setView}
          />
        </PageContent>
      </Page>
    </ProjectProvider>
  );
}
