import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project/checklists/$projectId")({
  component: RouteComponent,
  validateSearch: () => {
    return {};
  },
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Projects", "Checklists"]} />
      <PageContent>Checklilsts</PageContent>
    </Page>
  );
}
