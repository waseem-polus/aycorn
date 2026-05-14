import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Stage, StageType } from "@/types/types";
import { STAGE_TYPES } from "@/types/types";
import {
  STAGE_TYPE_COLORS,
  STAGE_TYPE_RULES,
  type StageTypeRule,
} from "@/features/workflows/shared/stage-type-rules";
import { StageColorSquare } from "@/features/workflows/details/stage-color-square";

export function StageTypeSummary({ stages }: { stages: Stage[] }) {
  const counts = useMemo(() => {
    const initial: Record<StageType, number> = {
      open: 0,
      todo: 0,
      doing: 0,
      done: 0,
      blocked: 0,
    };
    for (const s of stages) {
      initial[s.Type]++;
    }
    return initial;
  }, [stages]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
    <Card className="flex flex-col gap-1 rounded-lg py-3 px-3 shadow-none">
      <div className="flex items-center gap-1.5">
        <StageColorSquare color={STAGE_TYPE_COLORS[type]} className="size-2.5" />
        <span className="text-xs font-medium capitalize text-muted-foreground">
          {type}
        </span>
      </div>
      <span
        className={
          count === 0
            ? "text-lg font-normal leading-none text-muted-foreground/50"
            : "text-lg font-medium leading-none"
        }
      >
        {count}
      </span>
      <span className="text-xs text-muted-foreground">{rule.label}</span>
    </Card>
  );
}
