import { Page } from "@/components/page/Page";
import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import type { Project } from "@/types/types";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.Name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [projects, search]);

  useEffect(() => {
    fetch("http://localhost:8000/api/project")
      .then((res) => res.json())
      .then((projects: Project[]) => setProjects(projects));
  }, []);

  return (
    <Page breadcrumb={["Projects"]}>
      <h1 className="text-2xl">Projects</h1>

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
          <Button className="bg-emerald-500 hover:bg-emerald-500 hover:cursor-pointer">
            <Plus />
            New Project
          </Button>
        </div>

        <div className="rounded-md border">
          <ItemGroup>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, i) => (
                <React.Fragment key={project.ID}>
                  <Item asChild>
                    <Link
                      to="/project/$projectId"
                      params={{ projectId: `${project.ID}` }}
                      search={{
                        name: project.Name,
                      }}
                    >
                      <ItemContent>
                        <ItemTitle>
                          {project.Name}
                          {project.Pinned && (
                            <Pin className="stroke-red-400 size-4" />
                          )}
                        </ItemTitle>
                      </ItemContent>
                    </Link>
                  </Item>

                  {filteredProjects.length - 1 != i && <ItemSeparator />}
                </React.Fragment>
              ))
            ) : (
              <Empty>
                <EmptyDescription>No Projects Found</EmptyDescription>
              </Empty>
            )}
          </ItemGroup>
        </div>
      </div>
    </Page>
  );
}
