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
      <PageHeader breadcrumb={["Saved filters"]} />
      <PageContent>
        <PageTitle
          title="Saved filters"
          description="Named filters you can pin to any board and toggle on top of a view."
        />
        <FiltersPage />
      </PageContent>
    </Page>
  );
}
