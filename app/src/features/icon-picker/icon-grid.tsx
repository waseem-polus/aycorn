import { useLayoutEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const COLS = 8;
const CELL = 36; // icon button size (size-9)
const GAP = 1; // gutter so the keyboard selection ring isn't clipped
const ROW = CELL + GAP; // row pitch the virtualizer measures by

export function IconGrid({
  filtered,
  map,
  value,
  activeIndex,
  onSelect,
}: {
  filtered: string[];
  map: Map<string, LucideIcon>;
  value: string;
  activeIndex: number;
  onSelect: (iconName: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const rowCount = Math.ceil(filtered.length / COLS);
  // Center the active row in the 280px viewport.
  const activeOffset = Math.max(0, Math.floor(activeIndex / COLS) * ROW - 122);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW,
    overscan: 4,
    // Keep react-virtual's internal offset aligned with the DOM scrollTop we
    // set on mount below — otherwise it renders one region while the scrollbar
    // sits elsewhere.
    initialOffset: activeOffset,
  });

  // On open, set the real scrollTop directly (deterministic, no measurement
  // race). Afterwards, follow keyboard navigation via scrollToIndex.
  useLayoutEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (parentRef.current) parentRef.current.scrollTop = activeOffset;
      return;
    }
    if (activeIndex >= 0 && activeIndex < filtered.length) {
      rowVirtualizer.scrollToIndex(Math.floor(activeIndex / COLS));
    }
  }, [activeIndex, filtered.length, activeOffset, rowVirtualizer]);

  if (filtered.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
        No icons found
      </div>
    );
  }

  const footerLabel =
    hovered ??
    (activeIndex >= 0 && activeIndex < filtered.length
      ? filtered[activeIndex]
      : "");

  return (
    <div>
      <div
        ref={parentRef}
        className="h-[280px] overflow-auto p-1"
        onMouseLeave={() => setHovered(null)}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
          className="w-full"
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const start = virtualRow.index * COLS;
            return (
              <div
                key={virtualRow.key}
                className="absolute left-0 top-0 flex w-full gap-px"
                style={{
                  height: ROW,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {filtered.slice(start, start + COLS).map((name, i) => {
                  const index = start + i;
                  const Icon = map.get(name);
                  if (!Icon) return null;
                  const selected = name === value;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      aria-current={selected || undefined}
                      onClick={() => onSelect(name)}
                      onMouseEnter={() => setHovered(name)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md text-foreground hover:bg-accent",
                        selected && "bg-accent",
                        active && "ring-2 ring-ring",
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1 h-6 truncate border-t px-1 pt-1.5 text-xs text-muted-foreground">
        {footerLabel || " "}
      </div>
    </div>
  );
}
