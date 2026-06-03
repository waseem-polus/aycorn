import { Search, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { GroupByDropdown } from "@/features/upcoming/upcoming-page/group-by-dropdown";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";

type Props = {
  isFetching: boolean;
  resultCount: number;
  onFilterOpen: () => void;
};

export function UpcomingToolbar({
  isFetching,
  resultCount,
  onFilterOpen,
}: Props) {
  const {
    filters,
    view,
    setSearch,
    setGroupBy,
    setGranularity,
    activeFilterCount,
  } = useUpcomingFiltersContext();
  const search = filters.search;
  const filterCount = activeFilterCount();
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
            onChange={(e) => setSearch(e.target.value)}
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
          groupBy={view.groupBy}
          granularity={view.granularity}
          onChange={setGroupBy}
          onGranularityChange={setGranularity}
        />
      </div>
    </div>
  );
}
