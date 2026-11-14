import { FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";

type Props = Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
  activeCount: number;
};

/**
 * The button that opens a board's filter drawer: icon-only on desktop, icon
 * and label on mobile, with the number of active filters as a badge. Spreads
 * its props so it can be a drawer trigger (`asChild`).
 */
export function FilterButton({ activeCount, className, ...props }: Props) {
  const isMobile = useIsMobile();

  return (
    <Button
      variant="outline"
      size={isMobile ? "default" : "icon"}
      aria-label="Filters"
      className={className ? `relative ${className}` : "relative"}
      {...props}
    >
      <FilterIcon />
      {isMobile && "Filter"}
      {activeCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -top-1.5 -right-1.5 size-5 justify-center rounded-full p-0 text-xs tabular-nums"
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
