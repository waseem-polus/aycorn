import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/features/projects/projects-page";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Projects"]} />
      <PageContent>
        <PageTitle
          title="Projects"
          description="Manage and organize all your active projects."
        />
        <ProjectsPage />
      </PageContent>
    </Page>
  );
}
