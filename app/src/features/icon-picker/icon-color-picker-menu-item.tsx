import { useState } from "react";
import { PaletteIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorPicker } from "@/features/color-picker/color-picker";

type Props = {
  iconValue: string;
  colorValue: string;
  onIconSelect: (iconName: string) => void;
  onColorSelect: (color: string) => void;
  /** Called once a pick lands, so the host can close its menu. */
  onDone?: () => void;
};

/**
 * IconColorPicker as a dropdown menu entry: the "Change icon" item is itself
 * the popover trigger. For surfaces where the icon is read-only and editing
 * belongs in the options menu (the project card, which navigates on click).
 *
 * The host DropdownMenu must set `modal={false}` — a modal menu blocks pointer
 * events outside itself, so the popover would render but not respond.
 */
export function IconColorPickerMenuItem({
  iconValue,
  colorValue,
  onIconSelect,
  onColorSelect,
  onDone,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
    onDone?.();
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onDone?.();
  };

  return (
    <IconPickerPopover
      value={iconValue}
      onSelect={handleIconSelect}
      open={open}
      onOpenChange={setOpen}
      trigger={
        // preventDefault keeps the menu open: closing it would unmount the
        // popover's anchor while the popover is opening.
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <PaletteIcon className="text-muted-foreground" />
          Change icon
        </DropdownMenuItem>
      }
      headerSlot={
        <ColorPicker
          value={colorValue}
          onSelect={handleColorSelect}
          align="end"
        />
      }
    />
  );
}
