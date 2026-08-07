import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  stageStrokeClass,
  stageBadgeClass,
  stageCalendarBadgeClass,
} from "@/features/stage/stage-palette";
import { useTaskRelationshipsQuery } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import {
  groupRelationshipsByType,
  capitalize,
} from "@/features/task/relationships/relationships-grouping";
import type { RelationshipBehavior, TaskRelationshipType } from "@/types/types";

const BEHAVIOR_LABEL: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};

// System types get their behavior's display name as the hover-card heading.
// Custom types have no single canonical "name" field (only FromName/ToName),
// so FromName is used as the closest stand-in identity.
const headingFor = (type: TaskRelationshipType) =>
  type.IsSystem ? BEHAVIOR_LABEL[type.Behavior] : capitalize(type.FromName);

export function TaskRelationshipBadges({ taskId }: { taskId: number }) {
  const { data: relationships } = useTaskRelationshipsQuery(taskId);
  const groups = groupRelationshipsByType(relationships ?? []);

  return (
    <>
      {groups.map((group) => (
        <HoverCard key={group.key}>
          <HoverCardTrigger asChild>
            <Badge className={stageBadgeClass(group.type.Color)} tabIndex={0}>
              <DynamicIcon
                name={group.type.Icon as IconName}
                className={stageStrokeClass(group.type.Color)}
                fallback={() => <LinkIcon />}
              />
              <span className={stageCalendarBadgeClass(group.type.Color)}>
                {group.total}
              </span>
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-56 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DynamicIcon
                name={group.type.Icon as IconName}
                className={cn("size-3.5", stageStrokeClass(group.type.Color))}
                fallback={() => <LinkIcon className="size-3.5" />}
              />
              {headingFor(group.type)}
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {group.directions.map((d) => (
                <div
                  key={d.key}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium">{d.relationships.length}</span>
                </div>
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </>
  );
}
