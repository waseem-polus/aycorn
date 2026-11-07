import { useState } from "react";
import { DateRefEditor } from "@/features/task-filters/conditions/condition-builder/date-ref-editor";
import type { DateRef } from "@/features/task-filters/conditions/condition-types";

type Props = {
  from: DateRef | null;
  to: DateRef | null;
  /** Whether this editor was just reached through the keyboard flow and should open. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (from: DateRef | null, to: DateRef | null) => void;
};

/**
 * "between" as two independent ends, so either can be a calendar day or
 * relative ("between Today and Dec 31"). The range runs from the start of
 * `from`'s span to the end of `to`'s.
 */
export function DateRangeValueEditor({ from, to, open, onOpenChange, onChange }: Props) {
  // The keyboard flow opens "from"; picking it moves straight on to "to".
  const [toOpen, setToOpen] = useState(false);

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
      <span className="text-xs text-muted-foreground">From</span>
      <DateRefEditor
        value={from}
        placeholder="Start day"
        open={open}
        onOpenChange={onOpenChange}
        onChange={(ref) => {
          onChange(ref, to);
          if (ref && !to) setToOpen(true);
        }}
      />
      <span className="text-xs text-muted-foreground">To</span>
      <DateRefEditor
        value={to}
        edge="end"
        placeholder="End day"
        open={toOpen}
        onOpenChange={setToOpen}
        onChange={(ref) => onChange(from, ref)}
      />
    </div>
  );
}
