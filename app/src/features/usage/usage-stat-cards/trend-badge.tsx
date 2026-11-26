import { Badge } from "@/components/ui/badge";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

type TrendBadgeProps = {
  /** Signed change; the sign picks the icon. */
  delta: number;
  /** Appended to the number, e.g. "%" or " pts". */
  unit: string;
};

export function TrendBadge({ delta, unit }: TrendBadgeProps) {
  const Icon =
    delta > 0 ? TrendingUpIcon : delta < 0 ? TrendingDownIcon : MinusIcon;
  const sign = delta > 0 ? "+" : "";
  return (
    <Badge variant="outline">
      <Icon />
      {sign}
      {delta}
      {unit}
    </Badge>
  );
}
