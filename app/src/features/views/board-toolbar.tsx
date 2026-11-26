import { useCallback, useState } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import {
  ArrowUpDownIcon,
  BookmarkPlusIcon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";
import { adhocFilterHotkey } from "@/features/saved-filters/adhoc-filter/adhoc-filter-popover";
import {
  BoardToolbarRequestContext,
  type BoardToolbarAction,
} from "@/features/views/board-toolbar/board-toolbar-requests";
import { sortHotkey } from "@/features/views/board-toolbar/sort-popover";
import { useLocalStorage } from "@/features/calendar/hooks";
import { FilterRowToggle } from "@/features/views/board-toolbar/filter-row-toggle";
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
  /** The Sort popover: the shown view's sort rules. */
  sort: React.ReactNode;
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
  sort,
  adhocFilter,
  savedFilters,
}: Props) {
  const isMobile = useIsMobile();
  const [filterRowShown, setFilterRowShown] = useLocalStorage(
    "aycorn.board.filterRow",
    true,
  );
  const [request, setRequest] = useState<{ action: BoardToolbarAction } | null>(
    null,
  );
  const clearRequest = useCallback(() => setRequest(null), []);

  const toggleFilterRow = () => {
    setFilterRowShown((shown) => !shown);
    setRequest(null);
  };

  /** Shows the filter row if needed; the piece that owns `action` handles it once mounted. */
  const requestAction = (action: BoardToolbarAction) => {
    setFilterRowShown(true);
    setRequest({ action });
  };

  // Bound here rather than in the popovers so they work while the row is hidden.
  useHotkeys([
    { hotkey: sortHotkey, callback: () => requestAction("sort") },
    { hotkey: adhocFilterHotkey, callback: () => requestAction("filter") },
  ]);

  useRegisterCommands([
    {
      // One id for both directions so it stays a single recents entry.
      id: "board.filterRow.toggle",
      title: filterRowShown ? "Hide filter row" : "Show filter row",
      group: "Board",
      icon: ListFilterIcon,
      keywords: ["toolbar", "toggle", "filters", "sort"],
      run: toggleFilterRow,
    },
    {
      id: "board.sort.open",
      title: "Open sort editor",
      group: "Board",
      icon: ArrowUpDownIcon,
      hotkey: sortHotkey,
      keywords: ["order"],
      run: () => requestAction("sort"),
    },
    {
      id: "board.filter.open",
      title: "Open filter",
      group: "Board",
      icon: FilterIcon,
      hotkey: adhocFilterHotkey,
      keywords: ["ad hoc", "conditions"],
      run: () => requestAction("filter"),
    },
    {
      id: "board.savedFilter.create",
      title: "Create saved filter",
      group: "Board",
      icon: BookmarkPlusIcon,
      keywords: ["new", "add"],
      run: () => requestAction("createSavedFilter"),
    },
  ]);

  const filterToggle = (
    <FilterRowToggle
      shown={filterRowShown}
      onToggle={toggleFilterRow}
      activeCount={activeFilterCount}
    />
  );

  return (
    <BoardToolbarRequestContext.Provider value={{ request, clearRequest }}>
      <ViewMenuProvider>
        <div className="flex min-w-0 flex-col gap-2">
          {isMobile ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">{tabs}</div>
                <div className="flex shrink-0 items-center gap-2">
                  {actions}
                </div>
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
              {sort}
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
    </BoardToolbarRequestContext.Provider>
  );
}
