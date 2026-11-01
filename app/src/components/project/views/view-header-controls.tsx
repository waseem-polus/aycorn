import { TaskProvider } from "@/contexts/task/TaskProvider";
import { NewTaskEditorDrawer } from "@/features/task/new-task-editor-drawer";
import { ProjectFiltersDrawer } from "@/features/project-filters/project-filters-drawer";
import { TaskSearch } from "@/features/project-filters/task-search";
import { ProjectChecklists } from "@/components/project/views/project-checklists";
import { useProjectFiltersContext } from "@/features/project-filters/project-filters-context";
import { QuickFilterBar } from "@/features/saved-filters/quick-filter-bar";

export function ViewHeaderControls({
  setTaskDrawerOpen,
  children,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const filtersApi = useProjectFiltersContext();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="flex gap-2 flex-1">
          <TaskSearch />
          <ProjectFiltersDrawer />
        </div>
        <div className="flex gap-2 justify-between sm:justify-start">
          <ProjectChecklists />
          <TaskProvider>
            <NewTaskEditorDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
          </TaskProvider>
          {children}
        </div>
      </div>
      <QuickFilterBar api={filtersApi} />
    </div>
  );
}
