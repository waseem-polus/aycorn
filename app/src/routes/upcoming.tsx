import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Upcoming Tasks"]} />
      <PageContent>
        <h1>Upcoming Tasks</h1>
      </PageContent>
    </Page>
  );
}
