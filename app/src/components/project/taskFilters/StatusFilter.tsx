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
import { STATUSES } from "@/types/types";
import TaskStatusIcon from "@/components/task/taskDrawer/icons/TaskStatusIcon";

export function StatusFilter() {
  const { SetFilter, Filter } = useContext(ProjectContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Status
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STATUSES.map((status) => (
          <DropdownMenuCheckboxItem
            checked={Filter.Status.includes(status)}
            onCheckedChange={(checked) => {
              if (checked) {
                SetFilter({
                  ...Filter,
                  Status: [...Filter.Status, status],
                });
              } else {
                SetFilter({
                  ...Filter,
                  Status: Filter.Status.filter((s) => s !== status),
                });
              }
            }}
          >
            <TaskStatusIcon variant={status} />
            {status}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
