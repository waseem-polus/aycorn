import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  STAGE_COLORS,
  stageSwatchClass,
} from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

const COLS = 6;

type ColorGridProps = {
  value: string;
  onSelect: (color: string) => void;
};

export function ColorGrid({ value, onSelect }: ColorGridProps) {
  const initialIndex = () => {
    const i = STAGE_COLORS.indexOf(value as (typeof STAGE_COLORS)[number]);
    return i >= 0 ? i : 0;
  };

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [hovered, setHovered] = useState<string | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const start = initialIndex();
    setActiveIndex(start);
    requestAnimationFrame(() => buttonsRef.current[start]?.focus());
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (index: number) => {
    setActiveIndex(index);
    buttonsRef.current[index]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const last = STAGE_COLORS.length - 1;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveTo(Math.min(activeIndex + 1, last));
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveTo(Math.max(activeIndex - 1, 0));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveTo(Math.min(activeIndex + COLS, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(Math.max(activeIndex - COLS, 0));
        break;
    }
  };

  const footerLabel = hovered ?? STAGE_COLORS[activeIndex] ?? "";

  return (
    <div>
      <div
        className="grid grid-cols-6 gap-1"
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHovered(null)}
      >
        {STAGE_COLORS.map((color, index) => {
          const selected = color === value;
          return (
            <button
              key={color}
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              type="button"
              aria-label={color}
              aria-pressed={selected}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onSelect(color)}
              onMouseEnter={() => setHovered(color)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md outline-none ring-offset-2 ring-offset-popover focus-visible:ring-2 focus-visible:ring-ring",
                stageSwatchClass(color),
              )}
            >
              {selected && (
                <Check className="size-4 text-white drop-shadow" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-1 h-6 truncate border-t px-1 pt-1.5 text-xs text-muted-foreground">
        {footerLabel || " "}
      </div>
    </div>
  );
}
