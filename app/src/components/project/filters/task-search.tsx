import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Search } from "lucide-react";

export function TaskSearch() {
  const { Tasks, SetFilter, Filter } = useContext(ProjectContext);

  return (
    <InputGroup className="flex-1">
      <InputGroupInput
        placeholder="Filter Tasks..."
        onChange={(e) => SetFilter({ ...Filter, Name: e.target.value ?? "" })}
        value={Filter.Name}
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
