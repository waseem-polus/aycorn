import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { WorkflowsGrid } from "@/features/workflows/list/workflows-grid";
import { WorkflowsBulkActionsToolbar } from "@/features/workflows/list/workflows-bulk-actions-toolbar";
import { SelectionContext, useSelection } from "@/hooks/useSelection";

export const Route = createFileRoute("/workflows")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isFetching } = useAllWorkflowsQuery();
  const selection = useSelection();
  const { SelectionArea } = selection;

  return (
    <Page>
      <PageHeader breadcrumb={["Workflows"]} />
      <PageContent>
        <SelectionContext.Provider value={selection}>
          <SelectionArea className="flex flex-col gap-4 h-full">
            <PageTitle
              title="Workflows"
              description="Reusable stage sequences. Assign one to any project."
            />
            <WorkflowsGrid workflows={data ?? []} isFetching={isFetching} />
            <WorkflowsBulkActionsToolbar />
          </SelectionArea>
        </SelectionContext.Provider>
      </PageContent>
    </Page>
  );
}
