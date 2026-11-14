import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";

type Props = {
  isFetching: boolean;
  resultCount: number;
};

/** The upcoming page's task search, with the number of tasks shown. */
export function UpcomingSearch({ isFetching, resultCount }: Props) {
  const { filters, setSearch } = useUpcomingFiltersContext();

  return (
    <InputGroup className="flex flex-1">
      <InputGroupAddon>
        <Search className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search tasks…"
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <InputGroupAddon align="inline-end">
        {isFetching
          ? "…"
          : `${resultCount} ${resultCount === 1 ? "task" : "tasks"}`}
      </InputGroupAddon>
    </InputGroup>
  );
}
