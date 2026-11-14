import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Placeholder for sorting a board's tasks. Layout only for now — it has no
 * behaviour yet.
 */
export function SortButton() {
  // TODO: open a sort menu once sorting is designed.
  return (
    <Button variant="outline" size="sm" className="shrink-0">
      <ArrowUpDownIcon />
      Sort
    </Button>
  );
}
