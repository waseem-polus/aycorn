import { isValidElement, useState } from "react";
import { useFormatForDisplay } from "@tanstack/react-hotkeys";
import { ChevronRightIcon } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PaletteCommand } from "@/features/command-palette/command-types";

export function PaletteCommandItem({
  command,
  showGroup,
  onSelect,
}: {
  command: PaletteCommand;
  /** Shown while searching, when the list is flat and the heading is gone. */
  showGroup: boolean;
  onSelect: (command: PaletteCommand) => void;
}) {
  const format = useFormatForDisplay();
  const icon = command.icon;
  const Icon = isValidElement(icon) ? null : icon;
  // Checked on hover so the tooltip only appears when the title is cut off.
  const [isTruncated, setIsTruncated] = useState(false);

  return (
    <CommandItem value={command.id} onSelect={() => onSelect(command)}>
      {isValidElement(icon) ? icon : Icon && <Icon />}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="truncate"
            onPointerEnter={(event) =>
              setIsTruncated(
                event.currentTarget.scrollWidth > event.currentTarget.clientWidth,
              )
            }
          >
            {command.title}
          </span>
        </TooltipTrigger>
        {isTruncated && <TooltipContent>{command.title}</TooltipContent>}
      </Tooltip>
      <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        {command.hint && <span>{command.hint}</span>}
        {showGroup && <span>{command.group}</span>}
        {command.hotkey && <Kbd>{format(command.hotkey)}</Kbd>}
        {command.items && <ChevronRightIcon className="size-4" />}
      </span>
    </CommandItem>
  );
}
