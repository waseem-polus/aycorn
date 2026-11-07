import { ListView } from "@/components/project/views/listView/list-view";
import { KanbanView } from "@/components/project/views/kanbanView/kanban-view";
import { MonthView } from "@/components/project/views/calendarViews/month-view";
import { WeekView } from "@/components/project/views/calendarViews/week-view";
import type { ViewType } from "@/features/views/view-types";

/** The project page's renderer for a view's layout. */
export function ViewLayout({
  type,
  setTaskDrawerOpen,
}: {
  type: ViewType;
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  switch (type) {
    case "list":
      return <ListView setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "board":
      return <KanbanView setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "month":
      return <MonthView setTaskDrawerOpen={setTaskDrawerOpen} />;
    case "week":
      return <WeekView setTaskDrawerOpen={setTaskDrawerOpen} />;
  }
}
