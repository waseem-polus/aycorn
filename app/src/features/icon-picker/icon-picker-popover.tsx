import { useMemo, useState, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { loadIcons, type IconCache } from "@/features/icon-picker/icon-loader";
import { COLS, IconGrid } from "@/features/icon-picker/icon-grid";

type IconPickerPopoverProps = {
  /** Currently-selected icon, used to highlight the grid. Pass "" when none. */
  value: string;
  onSelect: (iconName: string) => void;
  /** The trigger element (rendered inside PopoverTrigger asChild). */
  trigger: ReactNode;
  /** Optional control rendered to the right of the search input (e.g. a color picker). */
  headerSlot?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  /**
   * Optional controlled open state. Omit both to let the popover manage its own
   * — needed when something other than the trigger opens it (e.g. a "Change
   * icon" item in a dropdown menu).
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * The icon search + grid in a popover, with lazy icon loading and keyboard
 * navigation. Used standalone (bulk toolbar) and composed inside
 * IconColorPicker (single task type / stage editing).
 */
export function IconPickerPopover({
  value,
  onSelect,
  trigger,
  headerSlot,
  align = "start",
  side = "bottom",
  open: controlledOpen,
  onOpenChange,
}: IconPickerPopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [query, setQuery] = useState("");
  const [cache, setCache] = useState<IconCache | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    if (!cache) return [];
    const q = query.trim().toLowerCase();
    return q ? cache.names.filter((n) => n.includes(q)) : cache.names;
  }, [cache, query]);

  const initialIndex = (c: IconCache) => {
    const i = c.names.indexOf(value);
    return i >= 0 ? i : 0;
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      return;
    }
    if (cache) {
      setActiveIndex(initialIndex(cache));
    } else {
      loadIcons().then((c) => {
        setCache(c);
        setActiveIndex(initialIndex(c));
      });
    }
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setActiveIndex(0);
  };

  const handleIconSelect = (name: string) => {
    onSelect(name);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    let next = activeIndex;
    switch (e.key) {
      case "ArrowRight":
        next = Math.min(activeIndex + 1, filtered.length - 1);
        break;
      case "ArrowLeft":
        next = Math.max(activeIndex - 1, 0);
        break;
      case "ArrowDown":
        next = Math.min(activeIndex + COLS, filtered.length - 1);
        break;
      case "ArrowUp":
        next = Math.max(activeIndex - COLS, 0);
        break;
      case "Enter":
        e.preventDefault();
        handleIconSelect(filtered[activeIndex]);
        return;
      default:
        return;
    }
    e.preventDefault();
    setActiveIndex(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      {/* Picking an icon must never reach an ancestor's onClick — the picker
          is used inside cards that navigate on click. */}
      <PopoverContent
        className="w-78 p-2"
        align={align}
        side={side}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        // The color popover in headerSlot portals outside this content and
        // autofocuses a swatch. Without this, that focus move reads as "focus
        // left the popover" and dismisses the grid — which is what happens
        // when this picker is opened from a dropdown menu item.
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 mb-2">
          <Input
            autoFocus
            placeholder="Search icons…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1"
          />
          {headerSlot}
        </div>
        {cache ? (
          <IconGrid
            filtered={filtered}
            map={cache.map}
            value={value}
            activeIndex={activeIndex}
            onSelect={handleIconSelect}
          />
        ) : (
          <div className="grid h-[280px] grid-cols-8 content-start gap-0.5">
            {Array.from({ length: 64 }).map((_, i) => (
              <Skeleton key={i} className="size-9 rounded-md" />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
