import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UpcomingPage } from "@/features/upcoming/upcoming-page";

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { layout?: string } => {
    return {
      layout: (search.layout as string) ?? "list",
    };
  },
});

function RouteComponent() {
  const { layout } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setLayout = (newLayout: string) =>
    navigate({ search: { layout: newLayout } });

  return <UpcomingPage layout={layout ?? "list"} setLayout={setLayout} />;
}
