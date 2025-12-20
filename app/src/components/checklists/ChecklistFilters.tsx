import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";

export function ChecklistFilters() {
  const { Checklists, SetFilter, Filter } = useContext(ProjectContext);

  return (
    <div className="flex gap-2">
      <InputGroup>
        <InputGroupInput
          placeholder="Filter Checklists..."
          onChange={(e) => SetFilter({ ...Filter, Name: e.target.value ?? "" })}
          value={Filter.Name}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {Checklists.length ?? 0} lists
        </InputGroupAddon>
      </InputGroup>
      <Button className="bg-emerald-500 hover:bg-emerald-500 hover:cursor-pointer">
        <Plus />
        New
      </Button>
    </div>
  );
}
