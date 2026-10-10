import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UpcomingPage,
  type UpcomingLayout,
} from "@/features/upcoming/upcoming-page";

const LAYOUTS = ["list", "month"] as const;
const DEFAULT_LAYOUT: UpcomingLayout = "list";

const parseLayout = (value: unknown): UpcomingLayout =>
  LAYOUTS.includes(value as UpcomingLayout)
    ? (value as UpcomingLayout)
    : DEFAULT_LAYOUT;

export const Route = createFileRoute("/upcoming")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { layout: UpcomingLayout } => ({
    layout: parseLayout(search.layout),
  }),
});

function RouteComponent() {
  const { layout } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setLayout = (newLayout: UpcomingLayout) =>
    navigate({ search: { layout: newLayout } });

  return <UpcomingPage layout={layout} setLayout={setLayout} />;
}
