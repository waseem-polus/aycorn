import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  headline: ReactNode;
  detail: ReactNode;
};

export function StatCard({
  label,
  value,
  badge,
  headline,
  detail,
}: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {badge && <CardAction>{badge}</CardAction>}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="font-medium">{headline}</div>
        <div className="text-muted-foreground">{detail}</div>
      </CardFooter>
    </Card>
  );
}
