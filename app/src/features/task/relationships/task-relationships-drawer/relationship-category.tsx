import { useState, useContext, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LinkIcon, PlusIcon } from "lucide-react";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { RelationshipTaskRow } from "@/features/task/relationships/task-relationships-drawer/relationship-task-row";
import { SelectRelationshipTask } from "@/features/task/relationships/task-relationships-drawer/select-relationship-task";
import { useCreateTaskRelationshipMutation } from "@/features/task/relationships/queries/useCreateTaskRelationshipMutation";
import type { RelationshipCategory } from "@/features/task/relationships/relationships-grouping";
import type { TaskWithProject } from "@/types/types";
import { TaskContext } from "@/contexts/task/TaskContext";

export function RelationshipCategorySection({
  category,
}: {
  category: RelationshipCategory;
}) {
  const [open, setOpen] = useState(false);
  const { state: currentTask } = useContext(TaskContext);
  const createRelationship = useCreateTaskRelationshipMutation();

  const excludeTaskIds = useMemo(
    () => new Set(category.relationships.map((rel) => rel.Other.ID)),
    [category.relationships],
  );

  const handleAdd = (task: TaskWithProject) => {
    const fromTaskId = category.direction === "from" ? currentTask.ID : task.ID;
    const toTaskId = category.direction === "from" ? task.ID : currentTask.ID;
    createRelationship.mutate({ fromTaskId, toTaskId, typeId: category.typeId });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 py-2">
        <span className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className={stageBadgeClass(category.color)}>
            <DynamicIcon
              name={category.icon as IconName}
              className={stageStrokeClass(category.color)}
              fallback={() => <LinkIcon />}
            />
            {category.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {category.relationships.length}
          </span>
        </span>
        <SelectRelationshipTask
          open={open}
          onOpenChange={setOpen}
          excludeTaskIds={excludeTaskIds}
          onSelect={handleAdd}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <PlusIcon />
              Add {category.label}
            </Button>
          }
        />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        {category.relationships.map((rel) => (
          <RelationshipTaskRow key={rel.ID} task={rel.Other} relationshipId={rel.ID} />
        ))}
      </div>
    </div>
  );
}
