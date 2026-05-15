import { useRef, useState } from "react";
import { Check } from "lucide-react";
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
import { StageColorSquare } from "@/features/workflows/details/stage-color-square";
import {
  STAGE_COLORS,
  stageSwatchClass,
} from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onSelect: (color: string) => void;
};

const COLS = 6;

export function ColorPicker({ value, onSelect }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const initialIndex = () => {
    const i = STAGE_COLORS.indexOf(value as (typeof STAGE_COLORS)[number]);
    return i >= 0 ? i : 0;
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const start = initialIndex();
      setActiveIndex(start);
      requestAnimationFrame(() => buttonsRef.current[start]?.focus());
    }
  };

  const handleSelect = (color: string) => {
    onSelect(color);
    setOpen(false);
  };

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

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Change color">
              <StageColorSquare color={value} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{value || "Pick a color"}</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-auto p-2"
        align="start"
        onKeyDown={handleKeyDown}
      >
        <div className="grid grid-cols-6 gap-1">
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
                onClick={() => handleSelect(color)}
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
      </PopoverContent>
    </Popover>
  );
}
