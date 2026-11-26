import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * A mode or scope shown in the palette input ("Commands", "Tasks"); Backspace
 * on an empty input also removes it.
 */
export function PaletteChip({
  label,
  removeLabel,
  onRemove,
}: {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="shrink-0 gap-1 pr-1">
      {label}
      <button
        type="button"
        aria-label={removeLabel}
        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
        onClick={onRemove}
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
  );
}
