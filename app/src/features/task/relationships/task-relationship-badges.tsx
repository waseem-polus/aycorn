import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  AtSignIcon,
  OctagonMinusIcon,
  SquareCheckIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  stageStrokeClass,
  stageCalendarBadgeClass,
  type StageColor,
} from "@/features/stage/stage-palette";
import { useTaskRelationshipCounts } from "@/features/task/relationships/queries/useTaskRelationshipsQuery";
import { CATEGORY_ORDER } from "@/features/task/relationships/relationships-grouping";
import type { RelationshipBehavior, TaskRelationship } from "@/types/types";

const BEHAVIOR_BADGES: {
  behavior: RelationshipBehavior;
  icon: LucideIcon;
  color: StageColor;
}[] = [
  { behavior: "blocking", icon: OctagonMinusIcon, color: "red" },
  { behavior: "subtask", icon: SquareCheckIcon, color: "emerald" },
  { behavior: "link", icon: AtSignIcon, color: "purple" },
];

const DIRECTION_ICONS: Record<"To" | "From", LucideIcon> = {
  To: ArrowDownRightIcon,
  From: ArrowUpRightIcon,
};

const DIRECTION_COPY: Record<
  "To" | "From",
  { title: string; description: string }
> = {
  To: { title: "Incoming", description: "Other tasks that relate to this one." },
  From: { title: "Outgoing", description: "This task relates to other tasks." },
};

const categoryLabel = (
  behavior: RelationshipBehavior,
  direction: TaskRelationship["Direction"],
) =>
  CATEGORY_ORDER.find(
    (c) => c.behavior === behavior && c.direction === direction,
  )?.label ?? behavior;

export function TaskRelationshipBadges({ taskId }: { taskId: number }) {
  const { data: relationshipCounts } = useTaskRelationshipCounts(taskId);

  const renderBadge = (direction: "To" | "From") => {
    const ArrowIcon = DIRECTION_ICONS[direction];
    const directionCounts = relationshipCounts?.[direction];
    if (!directionCounts) return null;

    const activeBadges = BEHAVIOR_BADGES.filter(
      ({ behavior }) => directionCounts[behavior] > 0,
    );
    if (activeBadges.length === 0) return null;

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge variant="secondary" className="text-foreground" tabIndex={0}>
            <ArrowIcon className="stroke-foreground" />
            {activeBadges.map(({ behavior, icon: Icon, color }) => (
              <Fragment key={behavior}>
                <Separator orientation="vertical" className="h-4! mx-1" />
                <Icon className={stageStrokeClass(color)} />
                <span className={stageCalendarBadgeClass(color)}>
                  {directionCounts[behavior]}
                </span>
              </Fragment>
            ))}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-56 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ArrowIcon className="size-3.5 stroke-foreground" />
            {DIRECTION_COPY[direction].title}
          </div>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            {DIRECTION_COPY[direction].description}
          </p>
          <div className="flex flex-col gap-1.5">
            {activeBadges.map(({ behavior, icon: Icon, color }) => (
              <div
                key={behavior}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Icon className={cn("size-3.5", stageStrokeClass(color))} />
                  {categoryLabel(
                    behavior,
                    direction.toLowerCase() as TaskRelationship["Direction"],
                  )}
                </span>
                <span className="font-medium">
                  {directionCounts[behavior]}
                </span>
              </div>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <>
      {renderBadge("To")}
      {renderBadge("From")}
    </>
  );
}
