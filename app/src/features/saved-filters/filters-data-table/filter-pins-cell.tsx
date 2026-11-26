import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import type { Project } from "@/types/types";

/**
 * How many views show this filter as a chip, with the views listed on hover.
 * Read-only: a view's saved filters are managed from its bar and view menu.
 */
export function FilterPinsCell({ filter, projects }: { filter: SavedFilter; projects: Project[] }) {
  const count = filter.Pins.length;
  if (count === 0) return <span className="text-sm text-muted-foreground">Not pinned</span>;

  const boardName = (projectId: number | null) =>
    projectId === null
      ? "Upcoming"
      : (projects.find((p) => p.ID === projectId)?.Name ?? "Project");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-sm text-muted-foreground">
          {count} view{count === 1 ? "" : "s"}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <ul>
          {filter.Pins.map((pin) => (
            <li key={pin.ViewID}>
              {boardName(pin.ProjectID)} › {pin.ViewName}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
