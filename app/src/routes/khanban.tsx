import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/khanban")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Khanban"]} />
      <PageContent>
        <h1>Khanban Board</h1>
      </PageContent>
    </Page>
  );
}
