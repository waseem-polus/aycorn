import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import type { Project } from "@/types/types";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { ProjectsDataTable } from "@/components/projects/projects-data-table";
import { NewProjectButton } from "@/features/projects/new-project-button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: projects, isFetching } = useAllProjectsQuery();
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (isFetching || !projects) {
      return [];
    }

    return projects.filter((project: Project) =>
      project.Name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [projects, search, isFetching]);

  return (
    <Page>
      <PageHeader breadcrumb={["Projects"]} />
      <PageContent>
        <PageTitle
          title="Projects"
          description="Manage and organize all your active projects."
        />

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <InputGroup>
              <InputGroupInput
                placeholder="Filter Projects..."
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {filteredProjects.length ?? 0} projects
              </InputGroupAddon>
            </InputGroup>
            <NewProjectButton />
          </div>

          <ProjectsDataTable data={filteredProjects} isFetching={isFetching} />
        </div>
      </PageContent>
    </Page>
  );
}
