import { createFileRoute } from "@tanstack/react-router";

import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { useUsageQuery } from "@/features/usage/queries/useUsageQuery";
import { UsageActivityChart } from "@/features/usage/usage-activity-chart";
import { UsageStatCards } from "@/features/usage/usage-stat-cards";

export const Route = createFileRoute("/usage")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: usage, isError, error } = useUsageQuery();

  return (
    <Page>
      <PageHeader breadcrumb={["Usage"]} />
      <PageContent fullWidth>
        {isError ? (
          <p className="text-destructive px-6 text-sm">
            Couldn't load usage: {error.message}
          </p>
        ) : (
          <>
            <UsageStatCards usage={usage} />
            <div className="lg:px-6">
              <UsageActivityChart activity={usage?.Activity} />
            </div>
          </>
        )}
      </PageContent>
    </Page>
  );
}
