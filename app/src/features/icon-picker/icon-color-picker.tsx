import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorPicker } from "@/features/color-picker/color-picker";
import { cn } from "@/lib/utils";

type IconColorPickerProps = {
  iconValue: string;
  colorValue: string;
  onIconSelect: (iconName: string) => void;
  onColorSelect: (color: string) => void;
  iconClassName?: string;
  buttonSize?: "icon-sm" | "icon" | "icon-lg"
};

const FALLBACK_ICON = "circle-dashed";

export function IconColorPicker({
  iconValue,
  colorValue,
  onIconSelect,
  onColorSelect,
  iconClassName,
  buttonSize = "icon-sm",
}: IconColorPickerProps) {
  return (
    <Tooltip>
      <IconPickerPopover
        value={iconValue}
        onSelect={onIconSelect}
        trigger={
          <TooltipTrigger asChild>
            <Button variant="ghost" size={buttonSize} aria-label="Change icon">
              <DynamicIcon
                name={(iconValue || FALLBACK_ICON) as IconName}
                className={cn("size-4", iconClassName)}
                fallback={() => <span className="size-4" />}
              />
            </Button>
          </TooltipTrigger>
        }
        headerSlot={
          <ColorPicker value={colorValue} onSelect={onColorSelect} align="end" />
        }
      />
      <TooltipContent>
        {iconValue ? `${colorValue} ${iconValue}` : "Pick an icon"}
      </TooltipContent>
    </Tooltip>
  );
}
