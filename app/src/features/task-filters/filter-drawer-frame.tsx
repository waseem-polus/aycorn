import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useMobile";

type Props = {
  /** Omit for an uncontrolled drawer opened by `trigger`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  activeCount: number;
  onReset: () => void;
  children: React.ReactNode;
};

/**
 * The shell every filter drawer shares: the responsive drawer itself, the
 * titled header with an active-filter badge, a scrolling body, and the reset
 * footer. Surfaces contribute only their sections as children.
 */
export function FilterDrawerFrame({
  open,
  onOpenChange,
  trigger,
  activeCount,
  onReset,
  children,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <Drawer
      handleOnly={!isMobile}
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center">
            <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
            Filters
            {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col flex-1 overflow-y-auto px-3 pt-2 gap-4 justify-between">
          {children}
        </div>

        <DrawerFooter>
          <Button variant="outline" disabled={activeCount === 0} onClick={onReset}>
            <RotateCcw className="size-3.5" />
            {activeCount > 0
              ? `Reset ${activeCount} filter${activeCount > 1 ? "s" : ""}`
              : "No filters applied"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
