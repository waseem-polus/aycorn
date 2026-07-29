import { useContext, useEffect } from "react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  stageBadgeClass,
  stageStrokeClass,
} from "@/features/stage/stage-palette";
import { TaskRelationshipsDrawer } from "@/features/task/relationships/task-relationships-drawer";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useIsMobile } from "@/hooks/useMobile";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LinkIcon } from "lucide-react";
import type { TaskRelationship } from "@/types/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <div className="relative flex justify-between items-start gap-3">
            <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground min-w-1/5 sm:min-w-1/7 min-h-9 align-middle">
                Links
            </span>

                  <Button variant="outline" className={cn("flex gap-2 px-3 w-full h-fit min-h-9 justify-start items-start flex-1 min-w-0")}>
                      <LinkIcon className="stroke-muted-foreground size-3.5 shrink mt-1" />
                {total === 0 ? (
                    <>
                        <span className="text-muted-foreground text-sm">
                            Manage links
                        </span>
                    </>
                ) : (
                    <span className="flex shrink gap-1 sm:gap-2 min-w-0 flex-wrap">
                    {groups.map((group) => (
                        <Badge
                            key={group.key}
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
            </Button>
        </div>
      </DrawerTrigger>
      <TaskRelationshipsDrawer />
    </Drawer>
  );
}
