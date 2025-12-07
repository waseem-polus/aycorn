import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { createFileRoute } from "@tanstack/react-router";

import data from "./data.json";
import { Page } from "@/components/Page";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={[]}>
      <SectionCards />
      <div className="lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </Page>
  );
}
