import { createFileRoute } from "@tanstack/react-router";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { FiltersPage } from "@/features/saved-filters/filters-page";

export const Route = createFileRoute("/filters")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Filters"]} />
      <PageContent>
        <PageTitle
          title="Filters"
          description="Saved filters you can pin to any board as a quick filter."
        />
        <FiltersPage />
      </PageContent>
    </Page>
  );
}
