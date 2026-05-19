import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import type { Checklist } from "@/types/types";

export function ChecklistFilters() {
  const { Checklists, SetFilter, Filter, Project, SetChecklists } =
    useContext(ProjectContext);
  const { create } = useChecklistMutation(Project.ID);

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
      <Button
        onClick={() =>
          create.mutate(undefined, {
            onSuccess: (newChecklist: Checklist) => {
              SetChecklists([
                ...Checklists,
                {
                  TotalCount: 0,
                  DoneCount: 0,
                  Status: "Open",
                  ...newChecklist,
                },
              ]);
            },
          })
        }
        className="hover:cursor-pointer"
      >
        <Plus />
        New
      </Button>
    </div>
  );
}
