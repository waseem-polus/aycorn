import type { Usage } from "@/features/usage/types";
import { StatCard } from "@/features/usage/usage-stat-cards/stat-card";
import { StatCardSkeleton } from "@/features/usage/usage-stat-cards/stat-card-skeleton";
import { TrendBadge } from "@/features/usage/usage-stat-cards/trend-badge";
import { Badge } from "@/components/ui/badge";

const gridClasses =
  "*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Percent change from previous to current; null when there's no baseline. */
const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100);

type UsageStatCardsProps = {
  usage: Usage | undefined;
};

export function UsageStatCards({ usage }: UsageStatCardsProps) {
  if (!usage) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const windowLabel = `the last ${usage.WindowDays} days`;
  const previousWindow = `the ${usage.WindowDays} days before`;

  const completed = usage.CompletedTasks;
  const completedDiff = completed.Current - completed.Previous;
  const completedChange = percentChange(completed.Current, completed.Previous);

  const priority = usage.OpenPriority;
  const openPriority = priority.Urgent + priority.High;

  const onTime = usage.OnTimeRate;
  const onTimeDelta =
    onTime.Current !== null && onTime.Previous !== null
      ? onTime.Current - onTime.Previous
      : null;

  return (
    <div className={gridClasses}>
      <StatCard
        label="Active Projects"
        value={usage.ActiveProjects}
        badge={
          usage.NewProjects > 0 && (
            <Badge variant="outline">+{usage.NewProjects} new</Badge>
          )
        }
        headline={
          usage.NewProjects > 0
            ? `${plural(usage.NewProjects, "project")} added in ${windowLabel}`
            : `No new projects in ${windowLabel}`
        }
        detail="Archived projects aren't counted"
      />

      <StatCard
        label="Completed Tasks"
        value={completed.Current}
        badge={
          completedChange !== null && (
            <TrendBadge delta={completedChange} unit="%" />
          )
        }
        headline={`Completed in ${windowLabel}`}
        detail={
          completedDiff === 0
            ? `Same as ${previousWindow}`
            : `${plural(Math.abs(completedDiff), "task")} ${completedDiff > 0 ? "more" : "fewer"} than ${previousWindow}`
        }
      />

      <StatCard
        label="Open High Priority"
        value={openPriority}
        badge={
          priority.Overdue > 0 && (
            <Badge variant="destructive">{priority.Overdue} overdue</Badge>
          )
        }
        headline={`${priority.Urgent} urgent · ${priority.High} high`}
        detail={
          priority.Overdue > 0
            ? `${plural(priority.Overdue, "task")} past due`
            : "Nothing high priority is past due"
        }
      />

      <StatCard
        label="Completed on Time"
        value={onTime.Current === null ? "—" : `${onTime.Current}%`}
        badge={
          onTimeDelta !== null && <TrendBadge delta={onTimeDelta} unit=" pts" />
        }
        headline={
          onTime.CurrentDue === 0
            ? `Nothing was due in ${windowLabel}`
            : `${onTime.CurrentOnTime} of ${plural(onTime.CurrentDue, "task")} due were done on time`
        }
        detail="Overdue open tasks count as late"
      />
    </div>
  );
}
