import type { Stage } from "@/types/types";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleMinus,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconByName: Record<string, LucideIcon> = {
  circle: Circle,
  "circle-dashed": CircleDashed,
  "circle-dot": CircleDot,
  "circle-check": CircleCheck,
  "circle-minus": CircleMinus,
  "circle-x": CircleX,
};

const strokeByColor: Record<string, string> = {
  gray: "stroke-neutral-500 dark:stroke-neutral-500",
  orange: "stroke-orange-400 dark:stroke-orange-700",
  green: "stroke-green-500 dark:stroke-green-600",
  purple: "stroke-purple-600 dark:stroke-purple-500",
  red: "stroke-red-700 dark:stroke-red-600",
  blue: "stroke-blue-500 dark:stroke-blue-400",
  yellow: "stroke-yellow-500 dark:stroke-yellow-400",
};

const tintByColor: Record<string, string> = {
  gray: "bg-accent",
  orange: "bg-orange-50 dark:bg-orange-950/40",
  green: "bg-green-50 dark:bg-green-950/40",
  purple: "bg-purple-50 dark:bg-purple-950/30",
  red: "bg-red-50 dark:bg-red-950/40",
  blue: "bg-blue-50 dark:bg-blue-950/40",
  yellow: "bg-yellow-50 dark:bg-yellow-950/40",
};

export function stageStrokeClass(color: string) {
  return strokeByColor[color] ?? "stroke-neutral-500";
}

export function stageTintClass(color: string) {
  return tintByColor[color] ?? "bg-accent";
}

export function StageIcon({
  stage,
  className,
}: {
  stage: Stage | undefined;
  className?: string;
}) {
  const Icon = stage ? iconByName[stage.Icon] ?? CircleDashed : CircleDashed;
  const stroke = stage ? stageStrokeClass(stage.Color) : "stroke-neutral-500";
  return <Icon className={cn("size-4", stroke, className)} />;
}
