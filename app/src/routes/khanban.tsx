import { Page } from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/khanban")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page breadcrumb={["Khanban"]}>
      <h1>Khanban Board</h1>
    </Page>
  );
}
