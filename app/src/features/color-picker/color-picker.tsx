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
};

export function ColorPicker({ value, onSelect }: ColorPickerProps) {
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
      <PopoverContent className="w-auto p-2" align="start">
        <ColorGrid value={value} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
