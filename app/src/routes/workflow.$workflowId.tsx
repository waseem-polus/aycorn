import { createFileRoute } from "@tanstack/react-router";
import {
  Page,
  PageContent,
  PageHeader,
} from "@/components/page/Page";
import { useAllWorkflowsQuery } from "@/features/workflows/shared/queries/useAllWorkflowsQuery";
import { WorkflowPageHeader } from "@/features/workflows/details/workflow-page-header";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";

export const Route = createFileRoute("/workflow/$workflowId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { workflowId } = Route.useParams();
  const { data, isFetching } = useAllWorkflowsQuery();

  const id = Number.parseInt(workflowId, 10);
  const workflow = data?.find((w) => w.ID === id);

  return (
    <Page>
      <PageHeader breadcrumb={["Workflows", workflow?.Name ?? ""]} />
      <PageContent>
        {workflow ? (
          <div className="flex flex-col gap-4">
            <WorkflowPageHeader workflow={workflow} />

            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Stages
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {workflow.Stages?.map((stage) => (
                  <WorkflowStageChip key={stage.ID} stage={stage} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
            {isFetching ? "Loading workflow..." : "Workflow not found."}
          </div>
        )}
      </PageContent>
    </Page>
  );
}
