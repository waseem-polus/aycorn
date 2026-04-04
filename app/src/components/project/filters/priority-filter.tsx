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
import { PRIORITIES } from "@/types/types";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";

export function PriorityFilter() {
  const { SetFilter, Filter } = useContext(ProjectContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Priority
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PRIORITIES.map((priority) => (
          <DropdownMenuCheckboxItem
            checked={Filter.Priority.includes(priority)}
            onCheckedChange={(checked) => {
              if (checked) {
                SetFilter({
                  ...Filter,
                  Priority: [...Filter.Priority, priority],
                });
              } else {
                SetFilter({
                  ...Filter,
                  Priority: Filter.Priority.filter((p) => p !== priority),
                });
              }
            }}
          >
            <TaskPriorityIcon variant={priority} />
            {priority}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
