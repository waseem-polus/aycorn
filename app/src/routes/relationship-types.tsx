import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { RelationshipTypesPage } from "@/features/relationship-types/relationship-types-page";

export const Route = createFileRoute("/relationship-types")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Relationship Types"]} />
      <PageContent>
        <PageTitle
          title="Task Relationship Types"
          description="Define how tasks relate to each other across your projects. Relationships are bidirectional and create a two-way link between tasks."
        />
        <RelationshipTypesPage />
      </PageContent>
    </Page>
  );
}
