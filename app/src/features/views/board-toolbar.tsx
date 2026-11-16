import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/features/calendar/hooks";
import { FilterRowToggle } from "@/features/views/board-toolbar/filter-row-toggle";
import { SortButton } from "@/features/views/board-toolbar/sort-button";
import { ViewMenuProvider } from "@/features/views/view-menu-provider";
import { useIsMobile } from "@/hooks/useMobile";

type Props = {
  /** The view switcher; renders itself as a dropdown on mobile. */
  tabs: React.ReactNode;
  search: React.ReactNode;
  /** Filters narrowing the list, shown on the filter row's toggle while the row is hidden. */
  activeFilterCount: number;
  /** The view-settings button. Desktop only — on mobile it's in the views dropdown. */
  viewSettings: React.ReactNode;
  /** Page-specific actions: Checklists and New Task, group-by, … */
  actions?: React.ReactNode;
  /** The Filter popover (unsaved condition builder), right of Sort. */
  adhocFilter: React.ReactNode;
  savedFilters: React.ReactNode;
};

/**
 * The layout every board (a project page, `/upcoming`) shares. Desktop: views
 * on the left; search, the filter toggle, view settings and actions on the right; Sort
 * and the saved filters on a second row. Mobile: views and actions, then
 * search and filter, then Sort and the saved filters. Layout only — each page
 * supplies the pieces.
 */
export function BoardToolbar({
  tabs,
  search,
  activeFilterCount,
  viewSettings,
  actions,
  adhocFilter,
  savedFilters,
}: Props) {
  const isMobile = useIsMobile();
  const [filterRowShown, setFilterRowShown] = useLocalStorage(
    "aycorn.board.filterRow",
    true,
  );
  const filterToggle = (
    <FilterRowToggle
      shown={filterRowShown}
      onToggle={() => setFilterRowShown((shown) => !shown)}
      activeCount={activeFilterCount}
    />
  );

  return (
    <ViewMenuProvider>
      <div className="flex min-w-0 flex-col gap-2">
        {isMobile ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">{tabs}</div>
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1">{search}</div>
              {filterToggle}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">{tabs}</div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex w-72">{search}</div>
              {filterToggle}
              {viewSettings}
              {actions}
            </div>
          </div>
        )}

        {filterRowShown && (
          <div className="flex min-w-0 items-center gap-2">
            <SortButton />
            {adhocFilter}
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-5"
            />
            <div className="min-w-0 flex-1">{savedFilters}</div>
          </div>
        )}
      </div>
    </ViewMenuProvider>
  );
}
