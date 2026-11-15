import { ProjectChecklists } from "@/components/project/views/project-checklists";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { useProjectFiltersContext } from "@/features/project-filters/project-filters-context";
import { TaskSearch } from "@/features/project-filters/task-search";
import { AdhocFilterPopover } from "@/features/saved-filters/adhoc-filter/adhoc-filter-popover";
import { QuickFilterBar } from "@/features/saved-filters/quick-filter-bar";
import { NewTaskEditorDrawer } from "@/features/task/new-task-editor-drawer";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { BoardToolbar } from "@/features/views/board-toolbar";
import { ViewSettingsButton } from "@/features/views/board-toolbar/view-settings-button";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { ViewTabs } from "@/features/views/view-tabs";

type Props = {
  views: BoardViewsAPI;
  selectedId: number | null;
  onSelect: (id: number) => void;
  sources: ConditionOptionSources;
  setTaskDrawerOpen: (open: boolean) => void;
};

/** The project page's views, search, filters and actions, in the shared board layout. */
export function ProjectBoardToolbar({
  views,
  selectedId,
  onSelect,
  sources,
  setTaskDrawerOpen,
}: Props) {
  const filtersApi = useProjectFiltersContext();

  return (
    <BoardToolbar
      tabs={
        <ViewTabs
          api={views}
          selectedId={selectedId}
          onSelect={onSelect}
          sources={sources}
        />
      }
      search={<TaskSearch />}
      activeFilterCount={filtersApi.activeFilterCount()}
      viewSettings={<ViewSettingsButton selectedId={selectedId} />}
      actions={
        <>
          <ProjectChecklists />
          <TaskProvider>
            <NewTaskEditorDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
          </TaskProvider>
        </>
      }
      adhocFilter={<AdhocFilterPopover api={filtersApi} sources={sources} />}
      quickFilters={<QuickFilterBar api={filtersApi.quick} sources={sources} />}
    />
  );
}
