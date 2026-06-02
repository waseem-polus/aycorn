import { Search, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { GroupByDropdown } from "@/features/upcoming/upcoming-page/group-by-dropdown";
import type {
  GroupByKey,
  Granularity,
} from "@/features/upcoming/hooks/useUpcomingFilters";

type Props = {
  search: string;
  isFetching: boolean;
  resultCount: number;
  filterCount: number;
  groupBy: GroupByKey;
  granularity: Granularity;
  onSearchChange: (value: string) => void;
  onFilterOpen: () => void;
  onGroupByChange: (value: GroupByKey) => void;
  onGranularityChange: (value: Granularity) => void;
};

export function UpcomingToolbar({
  search,
  isFetching,
  resultCount,
  filterCount,
  groupBy,
  granularity,
  onSearchChange,
  onFilterOpen,
  onGroupByChange,
  onGranularityChange,
}: Props) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <div className="flex gap-2 flex-1">
        <InputGroup className="flex flex-1">
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {isFetching
              ? "…"
              : `${resultCount} ${resultCount === 1 ? "task" : "tasks"}`}
          </InputGroupAddon>
        </InputGroup>

        <Button
          variant="outline"
          size={filterCount > 0 ? "default" : "icon"}
          onClick={onFilterOpen}
          className="gap-1.5"
        >
          <FilterIcon />
          {filterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>
      <div className="flex gap-2 justify-end sm:justify-start">
        <GroupByDropdown
          groupBy={groupBy}
          granularity={granularity}
          onChange={onGroupByChange}
          onGranularityChange={onGranularityChange}
        />
      </div>
    </div>
  );
}
