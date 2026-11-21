import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  CopyIcon,
  FilterIcon,
  GroupIcon,
  LayoutGridIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { definitionRuleCount } from "@/features/saved-filters/filter-definition";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { FilterFlyout } from "@/features/views/view-menu/filter-flyout";
import { GroupByFlyout } from "@/features/views/view-menu/group-by-flyout";
import { LayoutFlyout } from "@/features/views/view-menu/layout-flyout";
import { ViewMenuFlyout } from "@/features/views/view-menu/view-menu-flyout";
import { ViewMenuHeader } from "@/features/views/view-menu/view-menu-header";
import { SortEditor } from "@/features/views/sort/sort-editor";
import { sortApplies, sortSummary } from "@/features/views/view-sorts";
import { GROUP_LABELS, viewTypeLabel } from "@/features/views/view-groupings";
import type { BoardView, ViewPatch } from "@/features/views/view-types";

type Flyout = "layout" | "groupBy" | "sort" | "filter";

type Props = {
  view: BoardView;
  api: BoardViewsAPI;
  sources: ConditionOptionSources;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const icon = "text-muted-foreground";

/**
 * Everything inside a view's menu: the name and icon, one row per setting
 * (each opening a flyout), then move, duplicate and delete. It mounts when
 * the menu opens, so a flyout never outlives it. Settings save as they change.
 */
export function ViewMenuBody({
  view,
  api,
  sources,
  isFirst,
  isLast,
  onMove,
  onDuplicate,
  onDelete,
}: Props) {
  const [flyout, setFlyout] = useState<Flyout | null>(null);
  const onUpdate = (patch: ViewPatch) => void api.update(view.ID, patch);

  /** One flyout open at a time; a closing one doesn't close its replacement. */
  const flyoutState = (which: Flyout) => ({
    open: flyout === which,
    onOpenChange: (open: boolean) =>
      setFlyout((current) =>
        open ? which : current === which ? null : current,
      ),
  });

  const ruleCount = definitionRuleCount(view.Source);

  return (
    <>
      <ViewMenuHeader view={view} onUpdate={onUpdate} />

      <ViewMenuFlyout
        {...flyoutState("layout")}
        icon={<LayoutGridIcon className={icon} />}
        label="Layout"
        value={viewTypeLabel(view.Type)}
        contentClassName="w-72"
      >
        <LayoutFlyout
          type={view.Type}
          onChange={(type) => onUpdate({ type })}
        />
      </ViewMenuFlyout>

      <ViewMenuFlyout
        {...flyoutState("groupBy")}
        icon={<GroupIcon className={icon} />}
        label="Group by"
        value={view.GroupBy ? GROUP_LABELS[view.GroupBy] : "None"}
        contentClassName="w-60 p-0"
      >
        <GroupByFlyout
          view={view}
          board={api.board}
          onUpdate={onUpdate}
          onPicked={() => setFlyout(null)}
        />
      </ViewMenuFlyout>

      <ViewMenuFlyout
        {...flyoutState("sort")}
        icon={<ArrowUpDownIcon className={icon} />}
        label="Sort"
        // Calendars place tasks by time; the saved rules wait for a list or board.
        disabled={!sortApplies(view.Type)}
        value={
          sortApplies(view.Type)
            ? (sortSummary(view.Sort) ?? "None")
            : "By time"
        }
        // SortEditor sizes itself: a bare property list when empty, the rule editor otherwise.
        contentClassName="w-auto p-0"
      >
        <SortEditor
          view={view}
          board={api.board}
          onChange={(sort) => onUpdate({ sort })}
        />
      </ViewMenuFlyout>

      <ViewMenuFlyout
        {...flyoutState("filter")}
        icon={<FilterIcon className={icon} />}
        label="Filter"
        value={ruleCount > 0 ? ruleCount : "None"}
        contentClassName="max-h-[75vh] w-[36rem] max-w-[calc(100vw-2rem)] overflow-y-auto"
      >
        <FilterFlyout view={view} sources={sources} onUpdate={onUpdate} />
      </ViewMenuFlyout>

      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={isFirst} onSelect={() => onMove(-1)}>
        <ArrowLeftIcon className={icon} />
        Move left
      </DropdownMenuItem>
      <DropdownMenuItem disabled={isLast} onSelect={() => onMove(1)}>
        <ArrowRightIcon className={icon} />
        Move right
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onDuplicate}>
        <CopyIcon className={icon} />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem
        variant="destructive"
        disabled={api.views.length <= 1}
        onSelect={onDelete}
      >
        <Trash2Icon />
        Delete
      </DropdownMenuItem>
    </>
  );
}
