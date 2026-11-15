import { Separator } from "@/components/ui/separator";
import { SortButton } from "@/features/views/board-toolbar/sort-button";
import { ViewSettingsProvider } from "@/features/views/view-settings-provider";
import { useIsMobile } from "@/hooks/useMobile";

type Props = {
  /** The view switcher; renders itself as a dropdown on mobile. */
  tabs: React.ReactNode;
  search: React.ReactNode;
  filter: React.ReactNode;
  /** The view-settings button. Desktop only — on mobile it's in the views dropdown. */
  viewSettings: React.ReactNode;
  /** Page-specific actions: Checklists and New Task, group-by, … */
  actions?: React.ReactNode;
  /** The Filter popover (unsaved condition builder), right of Sort. */
  adhocFilter: React.ReactNode;
  quickFilters: React.ReactNode;
};

/**
 * The layout every board (a project page, `/upcoming`) shares. Desktop: views
 * on the left; search, filter, view settings and actions on the right; Sort
 * and the quick filters on a second row. Mobile: views and actions, then
 * search and filter, then Sort and the quick filters. Layout only — each page
 * supplies the pieces.
 */
export function BoardToolbar({
  tabs,
  search,
  filter,
  viewSettings,
  actions,
  adhocFilter,
  quickFilters,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <ViewSettingsProvider>
      <div className="flex min-w-0 flex-col gap-2">
        {isMobile ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">{tabs}</div>
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1">{search}</div>
              {filter}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">{tabs}</div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex w-72">{search}</div>
              {filter}
              {viewSettings}
              {actions}
            </div>
          </div>
        )}

        <div className="flex min-w-0 items-center gap-2">
          <SortButton />
          {adhocFilter}
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-5"
          />
          <div className="min-w-0 flex-1">{quickFilters}</div>
        </div>
      </div>
    </ViewSettingsProvider>
  );
}
