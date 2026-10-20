import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MatchMode } from "@/features/task-filters/conditions/condition-types";

type Props = {
  value: MatchMode;
  onChange: (match: MatchMode) => void;
};

/** "Match [All | Any] of the following" — All is AND, Any is OR. */
export function MatchToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>Match</span>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={value}
        onValueChange={(v) => v && onChange(v as MatchMode)}
        aria-label="Match mode"
      >
        <ToggleGroupItem value="all" className="px-3">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="any" className="px-3">
          Any
        </ToggleGroupItem>
      </ToggleGroup>
      <span className="text-muted-foreground">of the following</span>
    </div>
  );
}
