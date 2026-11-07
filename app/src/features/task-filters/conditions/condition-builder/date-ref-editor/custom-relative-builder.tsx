import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AmountStepper } from "@/features/task-filters/conditions/condition-builder/date-ref-editor/amount-stepper";
import { SegmentedControl } from "@/features/task-filters/conditions/condition-builder/date-ref-editor/segmented-control";
import type {
  RelativeAnchor,
  RelativeUnit,
} from "@/features/task-filters/conditions/condition-types";
import {
  MAX_RELATIVE_AMOUNT,
  dateRefLabel,
  dateSpanHint,
  isQuickPick,
  resolveDateRef,
  sameAnchor,
  type DateContext,
} from "@/features/task-filters/conditions/relative-dates";

type Props = {
  /** The current relative value, or null when none is set. */
  anchor: RelativeAnchor | null;
  ctx: DateContext;
  onChange: (anchor: RelativeAnchor) => void;
  onCommit: (anchor: RelativeAnchor) => void;
};

/**
 * The builder's two kinds. A period is a span ("Last 7 days" is a rolling
 * window, "This month" a calendar period); a shift is one day ("2 weeks ago").
 */
type Mode = "period" | "shift";
type Direction = "last" | "this" | "next";
type PeriodUnit = Extract<RelativeAnchor, { type: "period" }>["unit"];

const MODES: { value: Mode; label: string; example: string }[] = [
  { value: "period", label: "Period", example: "e.g. last 7 days, or this month" },
  { value: "shift", label: "Ago or from now", example: "e.g. 2 weeks from now" },
];

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "last", label: "Last" },
  { value: "this", label: "This" },
  { value: "next", label: "Next" },
];

const SHIFT_DIRECTIONS: { value: "ago" | "from_now"; label: string }[] = [
  { value: "ago", label: "Ago" },
  { value: "from_now", label: "From now" },
];

const UNITS: RelativeUnit[] = ["day", "week", "month", "year"];
const PERIOD_UNITS: PeriodUnit[] = ["week", "month", "year"];

const DEFAULT_ANCHOR: RelativeAnchor = { type: "window", amount: 7, unit: "day" };
const DEFAULT_AMOUNT = 7;

const modeOf = (anchor: RelativeAnchor): Mode => (anchor.type === "offset" ? "shift" : "period");

// The builder only makes "This …" periods; any other offset still shows as one.
const directionOf = (anchor: RelativeAnchor): Direction =>
  anchor.type === "period" ? "this" : anchor.amount < 0 ? "last" : "next";

const toPeriodUnit = (unit: RelativeUnit): PeriodUnit => (unit === "day" ? "week" : unit);

const unitLabel = (unit: RelativeUnit, plural: boolean) => (plural ? `${unit}s` : unit);

/**
 * Builds any relative date outside the quick picks. Every change applies at
 * once; Enter in the number applies and closes the picker.
 */
export function CustomRelativeBuilder({ anchor, ctx, onChange, onCommit }: Props) {
  // The builder's own value, kept while a quick pick is the current value so
  // picking Tomorrow doesn't wipe what was being built.
  const [draft, setDraft] = useState<RelativeAnchor>(() =>
    anchor && !isQuickPick(anchor) ? anchor : DEFAULT_ANCHOR,
  );
  // "This week" has no number, so remember the last one for Last/Next.
  const [lastAmount, setLastAmount] = useState(() =>
    draft.type === "period" ? DEFAULT_AMOUNT : Math.max(1, Math.abs(draft.amount)),
  );

  // A quick pick lives above; the builder only shows values it could have made.
  const applied = !!anchor && (!isQuickPick(anchor) || sameAnchor(anchor, draft));
  const current = applied ? anchor : draft;
  const mode = modeOf(current);
  const magnitude = current.type === "period" ? lastAmount : Math.abs(current.amount);
  const sign = current.type !== "period" && current.amount < 0 ? -1 : 1;

  const update = (next: RelativeAnchor) => {
    setDraft(next);
    if (next.type !== "period") setLastAmount(Math.abs(next.amount));
    onChange(next);
  };

  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    update(
      next === "shift"
        ? { type: "offset", amount: sign * magnitude, unit: current.unit }
        : { type: "window", amount: sign * magnitude, unit: current.unit },
    );
  };

  const handleDirectionChange = (direction: Direction) => {
    if (direction === "this") {
      update({ type: "period", offset: 0, unit: toPeriodUnit(current.unit) });
      return;
    }
    const amount = (direction === "last" ? -1 : 1) * magnitude;
    update({ type: "window", amount, unit: current.unit });
  };

  const handleAmountChange = (amount: number) => {
    if (current.type !== "period") update({ ...current, amount: sign * amount });
  };

  const handleUnitChange = (unit: string) =>
    update({ ...current, unit } as RelativeAnchor);

  const showsAmount = current.type !== "period";
  const unitSelect = (
    <Select value={current.unit} onValueChange={handleUnitChange}>
      <SelectTrigger size="sm" className="w-full" aria-label="Unit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(current.type === "period" ? PERIOD_UNITS : UNITS).map((unit) => (
          <SelectItem key={unit} value={unit}>
            {unitLabel(unit, showsAmount && magnitude !== 1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const span = resolveDateRef({ kind: "relative", anchor: current }, ctx);

  return (
    <div className="flex flex-col gap-2">
      <Select value={mode} onValueChange={(next) => handleModeChange(next as Mode)}>
        <SelectTrigger size="sm" className="w-full" aria-label="Kind of relative date">
          <SelectValue>{MODES.find((m) => m.value === mode)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              <span className="flex flex-col">
                <span>{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.example}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "period" && (
        <SegmentedControl
          label="Direction"
          value={directionOf(current)}
          options={DIRECTIONS}
          onChange={handleDirectionChange}
        />
      )}

      {showsAmount ? (
        <div className="grid grid-cols-2 gap-2">
          <AmountStepper
            value={magnitude}
            min={1}
            max={MAX_RELATIVE_AMOUNT}
            onChange={handleAmountChange}
            onEnter={() => onCommit(current)}
          />
          {unitSelect}
        </div>
      ) : (
        unitSelect
      )}

      {mode === "shift" && (
        <SegmentedControl
          label="Direction"
          value={sign < 0 ? "ago" : "from_now"}
          options={SHIFT_DIRECTIONS}
          onChange={(direction) =>
            update({ ...current, amount: (direction === "ago" ? -1 : 1) * magnitude } as RelativeAnchor)
          }
        />
      )}

      <div className="flex min-h-7 items-center gap-2 pt-1 text-sm text-muted-foreground">
        <CalendarIcon className="size-4 shrink-0" />
        <span className="flex-1">
          Today that’s <span className="text-foreground">{dateSpanHint(span)}</span>
        </span>
        {/* While nothing (or a quick pick) is applied, offer the builder's value. */}
        {!applied && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7"
            onClick={() => onCommit(current)}
            aria-label={`Use “${dateRefLabel({ kind: "relative", anchor: current })}”`}
          >
            Use
          </Button>
        )}
      </div>
    </div>
  );
}
