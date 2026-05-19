import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Upcoming"]} />
      <PageContent>
        <PageTitle
          title="Upcoming"
          description="View upcoming deadlines at a glance."
        />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        </section>
      </PageContent>
    </Page>
  );
}
