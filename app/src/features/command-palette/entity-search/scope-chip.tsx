import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  entityScopes,
  type EntityKind,
} from "@/features/command-palette/entity-search/entity-scopes";

/** The active search scope in the palette input; Backspace on an empty input also removes it. */
export function ScopeChip({
  scope,
  onRemove,
}: {
  scope: EntityKind;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="shrink-0 gap-1 pr-1">
      {entityScopes[scope].label}
      <button
        type="button"
        aria-label={`Search everything, not just ${entityScopes[scope].label.toLowerCase()}`}
        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
        onClick={onRemove}
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
  );
}
