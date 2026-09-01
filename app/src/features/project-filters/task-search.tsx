import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectFiltersContext } from "@/features/project-filters/project-filters-context";
import { Search } from "lucide-react";

export function TaskSearch() {
  const { Tasks } = useContext(ProjectContext);
  const { filters, setSearch } = useProjectFiltersContext();

  return (
    <InputGroup className="flex-1">
      <InputGroupInput
        placeholder="Filter Tasks..."
        onChange={(e) => setSearch(e.target.value ?? "")}
        value={filters.search}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        {Tasks.length ?? 0} tasks
      </InputGroupAddon>
    </InputGroup>
  );
}
