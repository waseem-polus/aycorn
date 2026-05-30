import { useContext } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { ChevronDown } from "lucide-react";
import { useProjectTaskTypesQuery } from "@/features/task-types/queries/useProjectTaskTypesQuery";
import TaskTypeIcon from "@/features/task/properties/icons/TaskTypeIcon";

export function TypeFilter() {
  const { SetFilter, Filter, Project } = useContext(ProjectContext);
  const { data: types = [] } = useProjectTaskTypesQuery(Project.ID);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Type
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-50 overflow-y-auto">
        {types.map((type) => (
          <DropdownMenuCheckboxItem
            key={type.ID}
            checked={Filter.Type.includes(type.ID)}
            onCheckedChange={(checked) => {
              if (checked) {
                SetFilter({ ...Filter, Type: [...Filter.Type, type.ID] });
              } else {
                SetFilter({
                  ...Filter,
                  Type: Filter.Type.filter((id) => id !== type.ID),
                });
              }
            }}
          >
            <TaskTypeIcon type={type} />
            {type.Name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
