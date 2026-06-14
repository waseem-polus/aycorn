import { cn } from "@/lib/utils";

export function CircularProgress({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? done / total : 0;

  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="stroke-muted-foreground"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <circle
        cx="8"
        cy="8"
        r={radius}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={`${progress * circumference} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 8 8)"
      />
    </svg>
  );
}
