import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { createFileRoute } from "@tanstack/react-router";

import { Page } from "@/components/Page";

export const Route = createFileRoute("/usage")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={[]}>
      <SectionCards />
      <div className="lg:px-6">
        <ChartAreaInteractive />
      </div>
    </Page>
  );
}
