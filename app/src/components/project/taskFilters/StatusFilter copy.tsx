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
import { TYPES } from "@/types/types";
import TaskTypeIcon from "@/components/task/taskDrawer/icons/TaskTypeIcon";

export function TypeFilter() {
  const { SetFilter, Filter } = useContext(ProjectContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Type
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {TYPES.map((type) => (
          <DropdownMenuCheckboxItem
            checked={Filter.Type.includes(type)}
            onCheckedChange={(checked) => {
              if (checked) {
                SetFilter({
                  ...Filter,
                  Type: [...Filter.Type, type],
                });
              } else {
                SetFilter({
                  ...Filter,
                  Type: Filter.Type.filter((t) => t !== type),
                });
              }
            }}
          >
            <TaskTypeIcon variant={type} />
            {type}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
