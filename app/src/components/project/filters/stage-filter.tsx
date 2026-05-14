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
import { StageIcon } from "@/features/stage/stage-visual";

export function StageFilter() {
  const { SetFilter, Filter, Stages } = useContext(ProjectContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Stage
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Stages.map((stage) => (
          <DropdownMenuCheckboxItem
            key={stage.ID}
            checked={Filter.Stage.includes(stage.ID)}
            onCheckedChange={(checked) => {
              if (checked) {
                SetFilter({
                  ...Filter,
                  Stage: [...Filter.Stage, stage.ID],
                });
              } else {
                SetFilter({
                  ...Filter,
                  Stage: Filter.Stage.filter((id) => id !== stage.ID),
                });
              }
            }}
          >
            <StageIcon stage={stage} />
            {stage.Name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
