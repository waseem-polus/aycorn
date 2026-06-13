import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Stage, StageType } from "@/types/types";
import { STAGE_TYPES } from "@/types/types";
import {
  STAGE_TYPE_RULES,
  type StageTypeRule,
} from "@/features/workflows/shared/stage-type-rules";
import { StageTypeBadge } from "@/features/workflows/details/stage-type-badge";

export function StageTypeSummary({ stages }: { stages: Stage[] }) {
  const counts = useMemo(() => {
    const initial: Record<StageType, number> = {
      open: 0,
      todo: 0,
      doing: 0,
      done: 0,
    };
    for (const s of stages) {
      initial[s.Type]++;
    }
    return initial;
  }, [stages]);

  return (
    <div className="flex gap-3 overflow-x-auto w-full">
      {STAGE_TYPES.map((type) => (
        <StageTypeSummaryItem
          key={type}
          type={type}
          count={counts[type]}
          rule={STAGE_TYPE_RULES[type]}
        />
      ))}
    </div>
  );
}

function StageTypeSummaryItem({
  type,
  count,
  rule,
}: {
  type: StageType;
  count: number;
  rule: StageTypeRule;
}) {
  return (
    <Card className="flex flex-1 bg-background flex-col gap-1 rounded-lg py-3 px-3 shadow-none items-start">
      <StageTypeBadge type={type} />
      <span
        className={
          count === 0
            ? "text-lg font-normal leading-none text-muted-foreground/50"
            : "text-lg font-medium leading-none"
        }
      >
        {count}
      </span>
      <span className="text-xs text-nowrap text-muted-foreground">
        {rule.label}
      </span>
    </Card>
  );
}
