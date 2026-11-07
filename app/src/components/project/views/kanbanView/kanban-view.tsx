import { useContext, useMemo } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewHeader } from "@/components/project/views/view-header";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import { NewTaskEditorDrawer } from "@/features/task/new-task-editor-drawer";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { buildBoardColumns } from "@/features/views/board/board-columns";
import { KanbanBoard } from "@/features/views/board/kanban-board";
import type { BoardView } from "@/features/views/view-types";

/** A project's board view: columns by the view's grouping, with in-column task creation. */
export function KanbanView({
  view,
  setTaskDrawerOpen,
}: {
  view: BoardView;
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  const { Project, Tasks, Stages } = useContext(ProjectContext);
  const { data: taskTypes = [] } = useTaskTypesQuery();
  const { data: categories = [] } = useTaskTypeCategoriesQuery();

  const columns = useMemo(
    () => buildBoardColumns(view.GroupBy, Tasks, { stages: Stages, taskTypes, categories }),
    [view.GroupBy, Tasks, Stages, taskTypes, categories],
  );

  return (
    <div className="h-full overflow-visible min-h-0 flex flex-col gap-2">
      <ViewHeader setTaskDrawerOpen={setTaskDrawerOpen} />

      <KanbanBoard
        columns={columns}
        projectId={Project.ID}
        renderCreate={(column) => (
          <TaskProvider>
            <NewTaskEditorDrawer defaults={column.changes} setTaskDrawerOpen={setTaskDrawerOpen}>
              <Button variant="ghost" size="icon-sm" aria-label={`New task in ${column.label}`}>
                <PlusIcon />
              </Button>
            </NewTaskEditorDrawer>
          </TaskProvider>
        )}
      />
    </div>
  );
}
