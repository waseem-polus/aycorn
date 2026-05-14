import { StageIcon, stageTintClass } from "@/features/stage/stage-visual";
import { Badge } from "@/components/ui/badge";
import { ItemGroup } from "@/components/ui/item";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useDropZone } from "@/hooks/useDropZone";
import type { Stage } from "@/types/types";
import { useContext, useMemo, type SyntheticEvent } from "react";
import { KanbanItem } from "./kanban-item";
import { cn } from "@/lib/utils";

type DragListeners = Record<string, (e: SyntheticEvent) => void>;

export function KanbanColumn({
  stage,
  getItemProps,
}: {
  stage: Stage;
  getItemProps?: (
    id: string,
    opts?: { listeners?: DragListeners },
  ) => Record<string, unknown>;
}) {
  const { setNodeRef, isOver } = useDropZone(stage.ID);

  const { Tasks } = useContext(ProjectContext);
  const filteredTasks = useMemo(
    () => Tasks.filter((task) => task.Stage === stage.ID),
    [Tasks, stage.ID],
  );

  const tint = stageTintClass(stage.Color);

  return (
    <div className="w-1/5 overflow-hidden flex flex-col gap-2 p-1 h-full min-h-full">
      <div className="p-2">
        <span className="flex items-center gap-2 text-foreground">
          <StageIcon stage={stage} />
          {stage.Name}
          <Badge variant="outline" className="size-5">
            {filteredTasks.length}
          </Badge>
        </span>
        {stage.Description && (
          <span className="text-muted-foreground text-sm">
            {stage.Description}
          </span>
        )}
      </div>
      <ItemGroup
        className={cn(
          "h-full overflow-y-scroll w-full min-w-0 overflow-x-visible flex flex-col gap-2 p-2 rounded-xl",
          isOver && tint,
        )}
        ref={setNodeRef}
      >
        {filteredTasks.map((task) => (
          <KanbanItem key={task.ID} task={task} getItemProps={getItemProps} />
        ))}
      </ItemGroup>
    </div>
  );
}
