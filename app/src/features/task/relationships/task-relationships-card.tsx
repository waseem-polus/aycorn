import { useContext, useEffect } from "react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { TaskRelationshipsDrawer } from "@/features/task/relationships/task-relationships-drawer";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useIsMobile } from "@/hooks/useMobile";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { ChevronRight, LinkIcon } from "lucide-react";
import type { TaskRelationship } from "@/types/types";
import { toast } from "sonner";

type RelationshipGroup = {
  key: string;
  type: TaskRelationship["Type"];
  direction: TaskRelationship["Direction"];
  total: number;
  done: number;
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// Group relationships by (type, direction) so each badge summarizes one
// directional bucket (e.g. all "blocked by" relationships for this task).
const groupRelationships = (
  relationships: TaskRelationship[],
): RelationshipGroup[] => {
  const groups = new Map<string, RelationshipGroup>();
  for (const rel of relationships) {
    const key = `${rel.Type.ID}-${rel.Direction}`;
    const group = groups.get(key) ?? {
      key,
      type: rel.Type,
      direction: rel.Direction,
      total: 0,
      done: 0,
    };
    group.total += 1;
    if (rel.Other.IsDone) group.done += 1;
    groups.set(key, group);
  }
  return [...groups.values()];
};

const groupLabel = (group: RelationshipGroup) => {
  const { type, direction, total, done } = group;
  if (type.Behavior === "blocking" && direction === "to") {
    return (
      <>
        <span className="font-semibold">{done}</span>
        <span className="font-light"> of </span>
        <span className="font-semibold">{total}</span>
        <span className="font-light"> blockers resolved</span>
      </>
    );
  }
  if (type.Behavior === "subtask" && direction === "from") {
    return (
      <>
        <span className="font-semibold">{done}</span>
        <span className="font-light"> of </span>
        <span className="font-semibold">{total}</span>
        <span className="font-light"> subtasks done</span>
      </>
    );
  }
  const name = direction === "from" ? type.FromName : type.ToName;
  return (
    <>
      <span className="font-light">{capitalize(name)}</span> {total}
    </>
  );
};

export function TaskRelationshipsCard() {
  const isMobile = useIsMobile();
  const { state: task } = useContext(TaskContext);
  const { data, isError } = useTaskRelationshipsQuery(task.ID);

  useEffect(() => {
    if (isError) toast.error("Failed to load linked tasks");
  }, [isError]);

  const relationships = data ?? [];
  const groups = groupRelationships(relationships);
  const total = relationships.length;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} handleOnly={!isMobile}>
      <DrawerTrigger asChild>
        <Card className="mx-3 sm:mx-6 mt-2 sm:mt-4 px-3 py-4 sm:p-4 hover:bg-accent hover:cursor-pointer min-w-0">
          <CardContent className="flex flex-col p-0 gap-4 sm:gap-2 min-w-0">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="size-3 stroke-muted-foreground" />
                Linked Tasks
              </span>

              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                Manage {total} {total === 1 ? "link" : "links"}
                <ChevronRight className="size-4" />
              </span>
            </div>
            {total === 0 ? (
              <span className="text-muted-foreground text-sm">
                No linked tasks
              </span>
            ) : (
              <span className="flex flex-1 gap-1 sm:gap-2 min-w-0 flex-wrap">
                {groups.map((group) => (
                  <Badge
                    key={group.key}
                    variant="outline"
                    className={stageBadgeClass(group.type.Color)}
                  >
                    <DynamicIcon
                      name={group.type.Icon as IconName}
                      className={stageStrokeClass(group.type.Color)}
                      fallback={() => <LinkIcon />}
                    />
                    {groupLabel(group)}
                  </Badge>
                ))}
              </span>
            )}
          </CardContent>
        </Card>
      </DrawerTrigger>
      <TaskRelationshipsDrawer />
    </Drawer>
  );
}
