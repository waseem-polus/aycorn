import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomRelativeBuilder } from "@/features/task-filters/conditions/condition-builder/date-ref-editor/custom-relative-builder";
import type { DateRef } from "@/features/task-filters/conditions/condition-types";
import {
  QUICK_PICK_ANCHORS,
  dateRefLabel,
  sameAnchor,
  type DateContext,
} from "@/features/task-filters/conditions/relative-dates";
import { cn } from "@/lib/utils";

type RelativeRef = Extract<DateRef, { kind: "relative" }>;

type Props = {
  value: RelativeRef | null;
  ctx: DateContext;
  /** A live edit from the custom builder; the popover stays open. */
  onChange: (ref: DateRef) => void;
  /** A finished pick (a quick pick, or Enter in the builder); the popover closes. */
  onCommit: (ref: DateRef) => void;
};

const QUICK_PICKS: RelativeRef[] = QUICK_PICK_ANCHORS.map((anchor) => ({ kind: "relative", anchor }));

/** The Relative tab: one-click days above a builder for everything else. */
export function RelativeDatePanel({ value, ctx, onChange, onCommit }: Props) {
  return (
    <div className="flex w-72 flex-col gap-3 pt-1">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Quick picks</span>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_PICKS.map((pick) => {
            const selected = !!value && sameAnchor(value.anchor, pick.anchor);
            return (
              <Button
                key={dateRefLabel(pick)}
                variant="outline"
                size="sm"
                aria-pressed={selected}
                onClick={() => onCommit(pick)}
                className={cn(
                  selected &&
                    "border-ring bg-accent text-accent-foreground dark:border-ring dark:bg-accent",
                )}
              >
                {dateRefLabel(pick)}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Separator className="flex-1 data-[orientation=horizontal]:w-auto" />
        <span className="text-xs font-medium text-muted-foreground">Or build a custom range</span>
        <Separator className="flex-1 data-[orientation=horizontal]:w-auto" />
      </div>
      <CustomRelativeBuilder
        anchor={value?.anchor ?? null}
        ctx={ctx}
        onChange={(anchor) => onChange({ kind: "relative", anchor })}
        onCommit={(anchor) => onCommit({ kind: "relative", anchor })}
      />
    </div>
  );
}
