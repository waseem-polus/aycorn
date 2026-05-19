import { ChecklistFilters } from "@/components/checklists/ChecklistFilters";
import { ChecklistsTable } from "@/components/checklists/ChecklistTable";
import { Page, PageContent, PageHeader } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project/checklists/$projectId")({
  component: RouteComponent,
  validateSearch: () => {
    return {};
  },
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={[{ label: "Projects", to: "/" }, "Checklists"]} />
      <PageContent>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl p-1">Checklists</h1>
          <ChecklistFilters />
          <ChecklistsTable />
        </div>
      </PageContent>
    </Page>
  );
}
