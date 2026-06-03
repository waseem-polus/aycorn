import { useState } from "react";
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
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorGrid } from "@/features/color-picker/color-grid";
import { StageColorSquare } from "@/features/workflows/details/stage-color-square";
import { cn } from "@/lib/utils";

type IconColorPickerProps = {
  iconValue: string;
  colorValue: string;
  onIconSelect: (iconName: string) => void;
  onColorSelect: (color: string) => void;
  iconClassName?: string;
};

const FALLBACK_ICON = "circle-dashed";

export function IconColorPicker({
  iconValue,
  colorValue,
  onIconSelect,
  onColorSelect,
  iconClassName,
}: IconColorPickerProps) {
  const [colorOpen, setColorOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setColorOpen(false);
  };

  return (
    <Tooltip>
      <IconPickerPopover
        value={iconValue}
        onSelect={onIconSelect}
        trigger={
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Change icon">
              <DynamicIcon
                name={(iconValue || FALLBACK_ICON) as IconName}
                className={cn("size-4", iconClassName)}
                fallback={() => <span className="size-4" />}
              />
            </Button>
          </TooltipTrigger>
        }
        headerSlot={
        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Change color">
                  <StageColorSquare color={colorValue} />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{colorValue || "Pick a color"}</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-2" align="end">
            <ColorGrid value={colorValue} onSelect={handleColorSelect} />
          </PopoverContent>
        </Popover>
        }
      />
      <TooltipContent>
        {iconValue ? `${colorValue} ${iconValue}` : "Pick an icon"}
      </TooltipContent>
    </Tooltip>
  );
}
