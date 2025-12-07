import { Page } from "@/components/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quickTasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={["Quick Tasks"]}>
      <h1>Quick Tasks</h1>
    </Page>
  );
}
