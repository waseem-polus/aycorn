import { ChartAreaInteractive } from "@/components/usage/ChartAreaInteractive";
import { SectionCards } from "@/components/usage/SectionCards";
import { createFileRoute } from "@tanstack/react-router";

import { Page, PageContent, PageHeader } from "@/components/page/Page";

export const Route = createFileRoute("/usage")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Usage"]} />
      <PageContent fullWidth>
        <SectionCards />
        <div className="lg:px-6">
          <ChartAreaInteractive />
        </div>
      </PageContent>
    </Page>
  );
}
