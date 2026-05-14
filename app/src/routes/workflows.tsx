import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { WorkflowsGrid } from "@/features/workflows/list/workflows-grid";

export const Route = createFileRoute("/workflows")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isFetching } = useAllWorkflowsQuery();

  return (
    <Page>
      <PageHeader breadcrumb={["Workflows"]} />
      <PageContent>
        <PageTitle
          title="Workflows"
          description="Reusable stage sequences. Assign one to any project."
        />
        <WorkflowsGrid workflows={data ?? []} isFetching={isFetching} />
      </PageContent>
    </Page>
  );
}
