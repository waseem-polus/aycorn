import { TaskProvider } from "@/contexts/task/TaskProvider";
import { NewTaskEditorDrawer } from "@/features/task/new-task-editor-drawer";
import { ChecklistFilter } from "@/components/project/filters/checklist-filter";
import { StageFilter } from "@/components/project/filters/stage-filter";
import { PriorityFilter } from "@/components/project/filters/priority-filter";
import { TypeFilter } from "@/components/project/filters/task-type-filter";
import { TaskSearch } from "@/components/project/filters/task-search";
import { ProjectChecklists } from "@/components/project/views/project-checklists";

export function ViewHeader({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  return (
    <>
      <div className="flex gap-2">
        <TaskSearch />
        <ProjectChecklists />
        <TaskProvider>
          <NewTaskEditorDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
        </TaskProvider>
      </div>

      <div className="flex flex-row flex-wrap gap-2">
        <ChecklistFilter />
        <StageFilter />
        <PriorityFilter />
        <TypeFilter />
      </div>
    </>
  );
}
