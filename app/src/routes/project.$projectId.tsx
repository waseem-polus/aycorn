import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { ProjectDetails } from "@/components/project/project-details";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useContext } from "react";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  // A view id; anything else (including the old "list"/"kanban" names)
  // falls back to the project's first view.
  validateSearch: (search: Record<string, unknown>): { view?: number } => {
    const view = Number(search.view);
    return { view: Number.isInteger(view) && view > 0 ? view : undefined };
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
  const setView = (viewId: number) => navigate({ search: { view: viewId } });

  return (
    <ProjectProvider>
      <Page>
        <ProjectPageHeader />
        <PageContent>
          <ProjectDetails
            projectId={Number.parseInt(projectId)}
            viewId={view}
            setViewId={setView}
          />
        </PageContent>
      </Page>
    </ProjectProvider>
  );
}
