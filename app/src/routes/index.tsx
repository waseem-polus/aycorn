import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/types";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { ProjectsDataTable } from "@/components/projects/projects-data-table";
import { SelectionContext, useSelection } from "@/hooks/useSelection";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: projects, isFetching } = useAllProjectsQuery();
  const { createProject } = useAllProjectsMutation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const selection = useSelection();
  const { SelectionArea } = selection;

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
        <SelectionContext.Provider value={selection}>
          <SelectionArea className="flex flex-col gap-4 h-full">
            <PageTitle
              title="Projects"
              description="Projects descriptions, go here and go brr."
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
                <Button
                  className="hover:cursor-pointer"
                  onClick={() =>
                    createProject.mutate(undefined, {
                      onSuccess: (res) =>
                        navigate({
                          to: "/project/$projectId",
                          params: { projectId: res },
                        }),
                    })
                  }
                >
                  <Plus />
                  New Project
                </Button>
              </div>

              <ProjectsDataTable
                data={filteredProjects}
                isFetching={isFetching}
              />
            </div>
          </SelectionArea>
        </SelectionContext.Provider>
      </PageContent>
    </Page>
  );
}
