import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UpcomingPage } from "@/features/upcoming/upcoming-page";

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
  // A view id; anything else (including the old `?layout=`) falls back to
  // the first view.
  validateSearch: (search: Record<string, unknown>): { view?: number } => {
    const view = Number(search.view);
    return { view: Number.isInteger(view) && view > 0 ? view : undefined };
  },
});

function RouteComponent() {
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setViewId = (viewId: number) => navigate({ search: { view: viewId } });

  return <UpcomingPage viewId={view} setViewId={setViewId} />;
}
