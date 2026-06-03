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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Project } from "@/types/types";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { ProjectsDataTable } from "@/components/projects/projects-data-table";
import { NewProjectButton } from "@/features/projects/new-project-button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

type PinFilter = "all" | "pinned" | "unpinned";

function RouteComponent() {
  const { data: projects, isPending } = useAllProjectsQuery();
  const [search, setSearch] = useState("");
  const [pinFilter, setPinFilter] = useState<PinFilter>("all");

  const filteredProjects = useMemo(() => {
    if (isPending || !projects) return [];
    return projects.filter((project: Project) => {
      if (!project.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (pinFilter === "pinned") return project.Pinned;
      if (pinFilter === "unpinned") return !project.Pinned;
      return true;
    });
  }, [projects, search, pinFilter, isPending]);

  return (
    <Page>
      <PageHeader breadcrumb={["Projects"]} />
      <PageContent>
        <PageTitle
          title="Projects"
          description="Manage and organize all your active projects."
        />

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center flex-col md:flex-row">
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
            <div className="flex gap-2 justify-between w-full md:justify-start md:w-fit">
              <ToggleGroup
                type="single"
                variant="outline"
                value={pinFilter}
                onValueChange={(v) => {
                  if (v) setPinFilter(v as PinFilter);
                }}
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="pinned">Pinned</ToggleGroupItem>
                <ToggleGroupItem value="unpinned">Unpinned</ToggleGroupItem>
              </ToggleGroup>
              <NewProjectButton />
            </div>
          </div>

          <ProjectsDataTable data={filteredProjects} isFetching={isPending} />
        </div>
      </PageContent>
    </Page>
  );
}
