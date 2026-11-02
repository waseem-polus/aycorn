import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { cn } from "@/lib/utils";

type Props = {
  filter: Pick<SavedFilter, "Name">;
  /** Marks unsaved local edits with a dot. */
  edited?: boolean;
  /** Off when the caller wraps the label in its own tooltip showing the name. */
  tooltip?: boolean;
  className?: string;
};

/**
 * A saved filter's identity — the one place every surface (quick-filter bar,
 * drawer header, pickers, /filters) renders it. Cosmetic fields such as icon
 * and color belong here once they exist.
 */
export function SavedFilterLabel({
  filter,
  edited = false,
  tooltip = true,
  className,
}: Props) {
  const name = <span className="truncate">{filter.Name}</span>;

  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{name}</TooltipTrigger>
          <TooltipContent>{filter.Name}</TooltipContent>
        </Tooltip>
      ) : (
        name
      )}
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
