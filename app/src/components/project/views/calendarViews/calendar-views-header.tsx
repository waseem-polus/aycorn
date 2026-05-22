import { ViewHeaderControls } from "@/components/project/views/view-header-controls";
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
    <div className="flex flex-col gap-4">
      <ViewHeaderControls setTaskDrawerOpen={setTaskDrawerOpen} />
      <DateNavigator view={view} />
    </div>
  );
}
