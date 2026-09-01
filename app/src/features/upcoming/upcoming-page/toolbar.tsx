import { Search, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";

type Props = {
  isFetching: boolean;
  resultCount: number;
  onFilterOpen: () => void;
  /** View-specific controls: group-by for the list, date navigation for the month. */
  children?: React.ReactNode;
};

export function UpcomingToolbar({
  isFetching,
  resultCount,
  onFilterOpen,
  children,
}: Props) {
  const { filters, setSearch, activeFilterCount } = useUpcomingFiltersContext();
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
          size={"icon"}
          onClick={onFilterOpen}
          className="gap-1.5 relative"
        >
          <FilterIcon />
          {filterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1.5 -right-1.5 size-5 justify-center rounded-full p-0 text-xs tabular-nums"
            >
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>
      <div className="flex gap-2 justify-end sm:justify-start">{children}</div>
    </div>
  );
}
