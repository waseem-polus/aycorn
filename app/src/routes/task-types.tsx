import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { TaskTypesPage } from "@/features/task-types/task-types-page";

export const Route = createFileRoute("/task-types")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Task Types"]} />
      <PageContent>
        <PageTitle
          title="Task Types"
          description="Define custom types for tasks across your projects."
        />
        <TaskTypesPage />
      </PageContent>
    </Page>
  );
}
