import { useFormatForDisplay } from "@tanstack/react-hotkeys";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  commandPaletteHotkey,
  searchPaletteHotkey,
  useCommandPalette,
} from "@/features/command-palette/command-palette-context";

/** Header button that opens entity search; the tooltip also teaches the command shortcut. */
export function CommandPaletteButton() {
  const { openPalette } = useCommandPalette();
  const format = useFormatForDisplay();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={() => openPalette("search")}
        >
          <SearchIcon />
          <span className="hidden md:inline">Search</span>
          <Kbd className="hidden md:inline-flex">{format(searchPaletteHotkey)}</Kbd>
          <span className="sr-only md:hidden">Search</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-stretch gap-1">
        <span className="flex items-center justify-between gap-6">
          Search <Kbd>{format(searchPaletteHotkey)}</Kbd>
        </span>
        <span className="flex items-center justify-between gap-6">
          Commands <Kbd>{format(commandPaletteHotkey)}</Kbd>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
