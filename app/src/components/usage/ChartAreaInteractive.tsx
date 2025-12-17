"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/useMobile";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", created: 12, completed: 8 },
  { date: "2024-04-02", created: 9, completed: 6 },
  { date: "2024-04-03", created: 11, completed: 7 },
  { date: "2024-04-04", created: 13, completed: 12 },
  { date: "2024-04-05", created: 14, completed: 10 },
  { date: "2024-04-06", created: 10, completed: 11 },
  { date: "2024-04-07", created: 9, completed: 6 },
  { date: "2024-04-08", created: 15, completed: 13 },
  { date: "2024-04-09", created: 4, completed: 5 },
  { date: "2024-04-10", created: 12, completed: 9 },
  { date: "2024-04-11", created: 13, completed: 14 },
  { date: "2024-04-12", created: 11, completed: 8 },
  { date: "2024-04-13", created: 15, completed: 16 },
  { date: "2024-04-14", created: 6, completed: 7 },
  { date: "2024-04-15", created: 7, completed: 5 },
  { date: "2024-04-16", created: 8, completed: 6 },
  { date: "2024-04-17", created: 18, completed: 14 },
  { date: "2024-04-18", created: 15, completed: 13 },
  { date: "2024-04-19", created: 9, completed: 7 },
  { date: "2024-04-20", created: 6, completed: 5 },
  { date: "2024-04-21", created: 7, completed: 6 },
  { date: "2024-04-22", created: 12, completed: 8 },
  { date: "2024-04-23", created: 7, completed: 10 },
  { date: "2024-04-24", created: 16, completed: 13 },
  { date: "2024-04-25", created: 11, completed: 12 },
  { date: "2024-04-26", created: 5, completed: 6 },
  { date: "2024-04-27", created: 17, completed: 18 },
  { date: "2024-04-28", created: 6, completed: 7 },
  { date: "2024-04-29", created: 13, completed: 10 },
  { date: "2024-04-30", created: 18, completed: 15 },

  { date: "2024-05-01", created: 10, completed: 9 },
  { date: "2024-05-02", created: 14, completed: 13 },
  { date: "2024-05-03", created: 11, completed: 8 },
  { date: "2024-05-04", created: 17, completed: 19 },
  { date: "2024-05-05", created: 20, completed: 17 },
  { date: "2024-05-06", created: 21, completed: 20 },
  { date: "2024-05-07", created: 16, completed: 13 },
  { date: "2024-05-08", created: 8, completed: 9 },
  { date: "2024-05-09", created: 9, completed: 7 },
  { date: "2024-05-10", created: 13, completed: 15 },
  { date: "2024-05-11", created: 14, completed: 11 },
  { date: "2024-05-12", created: 9, completed: 10 },
  { date: "2024-05-13", created: 9, completed: 7 },
  { date: "2024-05-14", created: 19, completed: 21 },
  { date: "2024-05-15", created: 20, completed: 17 },
  { date: "2024-05-16", created: 15, completed: 14 },
  { date: "2024-05-17", created: 22, completed: 20 },
  { date: "2024-05-18", created: 14, completed: 13 },
  { date: "2024-05-19", created: 10, completed: 7 },
  { date: "2024-05-20", created: 8, completed: 11 },
  { date: "2024-05-21", created: 6, completed: 5 },
  { date: "2024-05-22", created: 7, completed: 6 },
  { date: "2024-05-23", created: 12, completed: 13 },
  { date: "2024-05-24", created: 14, completed: 10 },
  { date: "2024-05-25", created: 11, completed: 12 },
  { date: "2024-05-26", created: 12, completed: 8 },
  { date: "2024-05-27", created: 19, completed: 20 },
  { date: "2024-05-28", created: 12, completed: 10 },
  { date: "2024-05-29", created: 5, completed: 7 },
  { date: "2024-05-30", created: 14, completed: 13 },
  { date: "2024-05-31", created: 9, completed: 11 },

  { date: "2024-06-01", created: 9, completed: 10 },
  { date: "2024-06-02", created: 22, completed: 18 },
  { date: "2024-06-03", created: 6, completed: 8 },
  { date: "2024-06-04", created: 20, completed: 17 },
  { date: "2024-06-05", created: 5, completed: 7 },
  { date: "2024-06-06", created: 13, completed: 11 },
  { date: "2024-06-07", created: 16, completed: 14 },
  { date: "2024-06-08", created: 17, completed: 15 },
  { date: "2024-06-09", created: 20, completed: 19 },
  { date: "2024-06-10", created: 7, completed: 8 },
  { date: "2024-06-11", created: 6, completed: 7 },
  { date: "2024-06-12", created: 21, completed: 18 },
  { date: "2024-06-13", created: 5, completed: 6 },
  { date: "2024-06-14", created: 19, completed: 16 },
  { date: "2024-06-15", created: 14, completed: 13 },
  { date: "2024-06-16", created: 17, completed: 15 },
  { date: "2024-06-17", created: 21, completed: 20 },
  { date: "2024-06-18", created: 7, completed: 9 },
  { date: "2024-06-19", created: 15, completed: 14 },
  { date: "2024-06-20", created: 18, completed: 17 },
  { date: "2024-06-21", created: 9, completed: 10 },
  { date: "2024-06-22", created: 14, completed: 13 },
  { date: "2024-06-23", created: 21, completed: 22 },
  { date: "2024-06-24", created: 6, completed: 7 },
  { date: "2024-06-25", created: 7, completed: 9 },
  { date: "2024-06-26", created: 20, completed: 17 },
  { date: "2024-06-27", created: 21, completed: 20 },
  { date: "2024-06-28", created: 8, completed: 9 },
  { date: "2024-06-29", created: 6, completed: 7 },
  { date: "2024-06-30", created: 18, completed: 16 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Completed",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Created",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tasks Completed vs. Created</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="created"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
