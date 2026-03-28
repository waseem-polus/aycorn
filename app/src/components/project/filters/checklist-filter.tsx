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

export function ChecklistFilter() {
  const { Checklists, SetFilter, Filter } = useContext(ProjectContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Checklist
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Checklists.map((checklist) => (
          <>
            <DropdownMenuCheckboxItem
              checked={Filter.Checklist.includes(checklist.ID)}
              onCheckedChange={(checked) => {
                if (checked) {
                  SetFilter({
                    ...Filter,
                    Checklist: [...Filter.Checklist, checklist.ID],
                  });
                } else {
                  SetFilter({
                    ...Filter,
                    Checklist: Filter.Checklist.filter(
                      (id) => id !== checklist.ID,
                    ),
                  });
                }
              }}
            >
              {checklist.Name}
            </DropdownMenuCheckboxItem>
          </>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
