import { cn } from "@/lib/utils";

const fillByColor: Record<string, string> = {
  gray: "bg-neutral-500",
  orange: "bg-orange-400 dark:bg-orange-600",
  green: "bg-green-500 dark:bg-green-600",
  purple: "bg-purple-600 dark:bg-purple-500",
  red: "bg-red-600 dark:bg-red-500",
  blue: "bg-blue-500 dark:bg-blue-400",
  yellow: "bg-yellow-500 dark:bg-yellow-400",
};

export function stageFillClass(color: string) {
  return fillByColor[color] ?? "bg-neutral-500";
}

export function StageColorSquare({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-label={`${color} color`}
      className={cn("inline-block size-4 rounded-sm", stageFillClass(color), className)}
    />
  );
}
