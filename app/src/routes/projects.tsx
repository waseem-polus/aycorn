import { Page } from "@/components/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={["Projects"]}>
      <h1>Projects</h1>
    </Page>
  );
}
