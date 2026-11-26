import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/useMobile";
import type { UsageDay } from "@/features/usage/types";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ranges = [
  { value: "90", label: "Last 3 months" },
  { value: "30", label: "Last 30 days" },
  { value: "7", label: "Last 7 days" },
] as const;

type RangeValue = (typeof ranges)[number]["value"];

const isRange = (value: string): value is RangeValue =>
  ranges.some((r) => r.value === value);

const chartConfig = {
  Created: {
    label: "Created",
    color: "var(--chart-5)",
  },
  Completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/** Parses YYYY-MM-DD as a local date (`new Date(str)` would read it as UTC
 * midnight and show the previous day west of Greenwich). */
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDay = (value: string) =>
  parseLocalDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

type UsageActivityChartProps = {
  activity: UsageDay[] | undefined;
};

export function UsageActivityChart({ activity }: UsageActivityChartProps) {
  const isMobile = useIsMobile();
  // Until the user picks a range, default to a week on mobile, 3 months otherwise.
  const [chosenRange, setRange] = useState<RangeValue | null>(null);
  const range = chosenRange ?? (isMobile ? "7" : "90");

  const handleRangeChange = (value: string) => {
    // ToggleGroup emits "" when the active item is clicked again; keep it.
    if (isRange(value)) setRange(value);
  };

  const days = (activity ?? []).slice(-Number(range));
  const totals = days.reduce(
    (sum, d) => ({
      created: sum.created + d.Created,
      completed: sum.completed + d.Completed,
    }),
    { created: 0, completed: 0 },
  );
  const rangeLabel = ranges.find((r) => r.value === range)?.label ?? "";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tasks Created vs. Completed</CardTitle>
        <CardDescription>
          {activity
            ? `${rangeLabel}: ${totals.created} created, ${totals.completed} completed`
            : rangeLabel}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={handleRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {ranges.map((r) => (
              <ToggleGroupItem key={r.value} value={r.value}>
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ranges.map((r) => (
                <SelectItem
                  key={r.value}
                  value={r.value}
                  className="rounded-lg"
                >
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!activity ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={days}>
              <defs>
                <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-Created)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-Created)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-Completed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-Completed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="Date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDay}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDay(String(value))}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="Created"
                type="monotone"
                fill="url(#fillCreated)"
                stroke="var(--color-Created)"
              />
              <Area
                dataKey="Completed"
                type="monotone"
                fill="url(#fillCompleted)"
                stroke="var(--color-Completed)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
