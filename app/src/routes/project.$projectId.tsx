import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { ProjectDetails } from "@/components/project/project";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useContext } from "react";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { view?: string } => {
    return {
      view: (search.view as string) ?? "table",
    };
  },
});

function ProjectPageHeader() {
  const { Project } = useContext(ProjectContext);
  return (
    <PageHeader breadcrumb={[{ label: "Projects", to: "/" }, Project.Name]}>
      <ProjectHeader />
    </PageHeader>
  );
}

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setView = (newView: string) => navigate({ search: { view: newView } });

  return (
    <ProjectProvider>
      <Page>
        <ProjectPageHeader />
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
