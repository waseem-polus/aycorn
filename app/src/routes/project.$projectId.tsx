import { Page } from "@/components/Page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project/$projectId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: (search.name as string) ?? "",
    };
  },
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { name } = Route.useSearch();

  return (
    <Page breadcrumb={["Projects", name]}>
      <h1 className="text-2xl">
        {name} ({projectId})
      </h1>
    </Page>
  );
}
