import { useMemo, useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { loadIcons, type IconCache } from "@/features/icon-picker/icon-loader";
import { COLS, IconGrid } from "@/features/icon-picker/icon-grid";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value: string;
  onSelect: (iconName: string) => void;
  color?: string;
  iconClassName?: string;
};

const FALLBACK_ICON = "circle-dashed";

export function IconPicker({
  value,
  onSelect,
  color,
  iconClassName,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cache, setCache] = useState<IconCache | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    if (!cache) return [];
    const q = query.trim().toLowerCase();
    return q ? cache.names.filter((n) => n.includes(q)) : cache.names;
  }, [cache, query]);

  // On open, query is always "" (reset on close), so `filtered` === names and
  // this index is valid for both the grid and keyboard nav.
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

  const handleSelect = (name: string) => {
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
        handleSelect(filtered[activeIndex]);
        return;
      default:
        return;
    }
    e.preventDefault();
    setActiveIndex(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Change icon"
            >
              <DynamicIcon
                name={(value || FALLBACK_ICON) as IconName}
                className={cn("size-4", iconClassName)}
                style={color ? { color } : undefined}
                fallback={() => <span className="size-4" />}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{value || "Pick an icon"}</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-[312px] p-2"
        align="start"
        onKeyDown={handleKeyDown}
      >
        <Input
          autoFocus
          placeholder="Search icons…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="mb-2"
        />
        {cache ? (
          <IconGrid
            filtered={filtered}
            map={cache.map}
            value={value}
            activeIndex={activeIndex}
            onSelect={handleSelect}
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
