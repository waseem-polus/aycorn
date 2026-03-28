import { KanbanColumn } from "@/components/project/views/kanbanView/kanban-column";
import { ViewHeader } from "@/components/project/views/view-header";

export function KanbanView({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  return (
    <div className="h-full overflow-visible min-h-0 flex flex-col gap-2">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <div className="div flex gap-2 h-full min-h-0">
        <KanbanColumn status="Blocked" description="Tasks cannot be started" />
        <KanbanColumn status="Open" description="Tasks are being planned" />
        <KanbanColumn status="Todo" description="Tasks are ready to start" />
        <KanbanColumn status="Doing" description="Tasks are being worked on" />
        <KanbanColumn status="Done" description="Tasks are completed" />
      </div>
    </div>
  );
}
