import { createFileRoute } from "@tanstack/react-router";
import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { useWorkflowDetailsQuery } from "@/features/workflows/shared/queries/useWorkflowDetailsQuery";
import { WorkflowPageHeader } from "@/features/workflows/details/workflow-page-header";
import { StageTypeSummary } from "@/features/workflows/details/stage-type-summary";
import { StageList } from "@/features/workflows/details/stage-list";
import { StagesBulkActionsToolbar } from "@/features/workflows/details/stages-bulk-actions-toolbar";

export const Route = createFileRoute("/workflow/$workflowId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { new?: boolean } => {
    const isNew = search.new === true || search.new === "true";
    return isNew ? { new: true } : {};
  },
});

function RouteComponent() {
  const { workflowId } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const id = Number.parseInt(workflowId, 10);
  const { data: workflow, isFetching } = useWorkflowDetailsQuery(id);

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "Workflows", to: "/workflows" },
          workflow?.Name ?? "Untitled Workflow",
        ]}
      />
      <PageContent>
        {workflow ? (
          <div className="flex flex-col gap-6 flex-1 min-h-0">
            <WorkflowPageHeader workflow={workflow} autoFocusName={isNew} />
            {/* TODO: Replace this with a kanban preview */}
            <StageTypeSummary stages={workflow.Stages ?? []} />
            <StageList stages={workflow.Stages ?? []} workflowId={id} />
            <StagesBulkActionsToolbar
              stages={workflow.Stages ?? []}
              workflowId={id}
            />
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
