import { Page } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={["Upcoming Tasks"]}>
      <h1>Upcoming Tasks</h1>
    </Page>
  );
}
