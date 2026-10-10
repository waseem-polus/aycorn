import { useState } from "react";
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
import { ColorGrid } from "@/features/color-picker/color-grid";

type ColorPickerProps = {
  value: string;
  onSelect: (color: string) => void;
  align?: "start" | "center" | "end";
};

/**
 * The swatch button + color grid in a popover. Used standalone and as the
 * headerSlot of the icon pickers.
 */
export function ColorPicker({
  value,
  onSelect,
  align = "start",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (color: string) => {
    onSelect(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      {/* Picking a color must never reach an ancestor's onClick — the picker
          is used inside cards that navigate on click. */}
      <PopoverContent
        className="w-auto p-2"
        align={align}
        onClick={(e) => e.stopPropagation()}
      >
        <ColorGrid value={value} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
