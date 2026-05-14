import { TaskProvider } from "@/contexts/task/TaskProvider";
import { NewTaskEditorDrawer } from "@/features/task/new-task-editor-drawer";
import { ChecklistFilter } from "@/components/project/filters/checklist-filter";
import { StageFilter } from "@/components/project/filters/stage-filter";
import { PriorityFilter } from "@/components/project/filters/priority-filter";
import { TypeFilter } from "@/components/project/filters/task-type-filter";
import { Settings } from "@/features/calendar/settings/settings";
import { TaskSearch } from "@/components/project/filters/task-search";
import { ProjectChecklists } from "@/components/project/views/project-checklists";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import type { TCalendarView } from "@/features/calendar/types";

export function CalendarViewHeader({
  setTaskDrawerOpen,
  view,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
  view: TCalendarView;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <TaskSearch />
        <ProjectChecklists />
        <TaskProvider>
          <NewTaskEditorDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
        </TaskProvider>
        <Settings />
      </div>

      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <ChecklistFilter />
          <StageFilter />
          <PriorityFilter />
          <TypeFilter />
        </div>
        <DateNavigator view={view} />
      </div>
    </div>
  );
}
