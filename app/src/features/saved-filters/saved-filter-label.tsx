import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { cn } from "@/lib/utils";

type Props = {
  filter: Pick<SavedFilter, "Name">;
  /** Marks unsaved local edits with a dot. */
  edited?: boolean;
  className?: string;
};

/**
 * A saved filter's identity — the one place every surface (quick-filter bar,
 * drawer header, pickers, /filters) renders it. Cosmetic fields such as icon
 * and color belong here once they exist.
 */
export function SavedFilterLabel({ filter, edited = false, className }: Props) {
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate">{filter.Name}</span>
        </TooltipTrigger>
        <TooltipContent>{filter.Name}</TooltipContent>
      </Tooltip>
      {edited && (
        <span
          className="size-1.5 shrink-0 rounded-full bg-primary"
          role="img"
          aria-label="Unsaved changes"
        />
      )}
    </span>
  );
}
