import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useContext } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useChecklistMutation } from "@/queries/useChecklistMutation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Checklist, ChecklistStatus } from "@/types/types";

export type ChecklistStatusFilter = "all" | ChecklistStatus;

type ChecklistFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ChecklistStatusFilter;
  onStatusFilterChange: (value: ChecklistStatusFilter) => void;
  count: number;
  onCreated?: (id: number) => void;
};

export function ChecklistFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  count,
  onCreated,
}: ChecklistFiltersProps) {
  const { Checklists, SetChecklists, Project } = useContext(ProjectContext);
  const { create } = useChecklistMutation(Project.ID);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Filter Checklists..."
            onChange={(e) => onSearchChange(e.target.value)}
            value={search}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">{count} lists</InputGroupAddon>
        </InputGroup>
        <Button
          onClick={() =>
            create.mutate("", {
              onSuccess: (newChecklist: Checklist) => {
                SetChecklists([
                  ...Checklists,
                  {
                    TotalCount: 0,
                    DoneCount: 0,
                    Status: "unused",
                    StageCounts: [],
                    ...newChecklist,
                  },
                ]);
                onCreated?.(newChecklist.ID);
              },
            })
          }
          className="hover:cursor-pointer"
        >
          <Plus />
          New
        </Button>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        value={statusFilter}
        onValueChange={(v) => {
          if (v) onStatusFilterChange(v as ChecklistStatusFilter);
        }}
        className="self-start"
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="unused">Unused</ToggleGroupItem>
        <ToggleGroupItem value="doing">Doing</ToggleGroupItem>
        <ToggleGroupItem value="done">Done</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
