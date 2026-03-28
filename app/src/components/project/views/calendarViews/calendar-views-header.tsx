import { TaskProvider } from "@/contexts/task/TaskProvider";
import { NewTaskSideDrawer } from "@/components/task/NewTaskSideDrawer";
import { ChecklistFilter } from "@/components/project/filters/checklist-filter";
import { StatusFilter } from "@/components/project/filters/status-filter";
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
          <NewTaskSideDrawer setTaskDrawerOpen={setTaskDrawerOpen} />
        </TaskProvider>
        <Settings />
      </div>

      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <ChecklistFilter />
          <StatusFilter />
          <PriorityFilter />
          <TypeFilter />
        </div>
        <DateNavigator view={view} />
      </div>
    </div>
  );
}
