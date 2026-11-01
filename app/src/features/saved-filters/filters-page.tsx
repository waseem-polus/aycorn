import { useState } from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FiltersDataTable } from "@/features/saved-filters/filters-data-table";
import { useSavedFiltersQuery } from "@/features/saved-filters/queries/useSavedFiltersQuery";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";

/**
 * The library of saved filters. Management only — filters are created and
 * their conditions edited from a board's filter drawer.
 */
export function FiltersPage() {
  const [search, setSearch] = useState("");
  const { data: filters = [], isPending } = useSavedFiltersQuery();
  const { data: projects = [] } = useAllProjectsQuery();
  const query = search.trim().toLowerCase();
  const shown = query ? filters.filter((f) => f.Name.toLowerCase().includes(query)) : filters;

  return (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search filters…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {shown.length} {shown.length === 1 ? "filter" : "filters"}
        </InputGroupAddon>
      </InputGroup>
      <FiltersDataTable
        data={shown}
        projects={projects}
        isLoading={isPending}
        emptyMessage={
          filters.length === 0
            ? "No saved filters yet. Save one from any board's filter drawer."
            : "No filters match your search."
        }
      />
    </div>
  );
}
