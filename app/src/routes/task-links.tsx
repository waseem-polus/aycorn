import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { RelationshipTypesPage } from "@/features/relationship-types/relationship-types-page";

export const Route = createFileRoute("/task-links")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Task Links"]} />
      <PageContent>
        <PageTitle
          title="Task Links"
          description="Links are a bidirectional connection between tasks across your projects."
        />
        <RelationshipTypesPage />
      </PageContent>
    </Page>
  );
}
