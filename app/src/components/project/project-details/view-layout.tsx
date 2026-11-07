import { ListView } from "@/components/project/views/listView/list-view";
import { KanbanView } from "@/components/project/views/kanbanView/kanban-view";
import { MonthView } from "@/components/project/views/calendarViews/month-view";
import { WeekView } from "@/components/project/views/calendarViews/week-view";
import type { BoardView } from "@/features/views/view-types";

/** The project page's renderer for a view's layout. */
export function ViewLayout({
  view,
  setTaskDrawerOpen,
}: {
  view: BoardView;
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  switch (view.Type) {
    case "list":
      return <ListView view={view} setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "board":
      return <KanbanView view={view} setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "month":
      return <MonthView setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "week":
      return <WeekView setTaskDrawerOpen={setTaskDrawerOpen} />;
  }
}
