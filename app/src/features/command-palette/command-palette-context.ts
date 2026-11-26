import { createContext, useContext } from "react";
import type { Hotkey } from "@tanstack/hotkeys";
import type { CommandRegistry } from "@/features/command-palette/command-registry";
import type { PaletteMode } from "@/features/command-palette/command-types";

/** Opens the palette in entity search mode (VS Code's quick open). */
export const searchPaletteHotkey = "Mod+P" as Hotkey;
/**
 * Opens the palette in command mode. Not VS Code's Mod+Shift+P: Firefox
 * reserves that for a private window and never passes it to the page.
 */
export const commandPaletteHotkey = "Mod+K" as Hotkey;

/** Typed at the start of the input, switches the palette into command mode. */
export const commandPrefix = ">";

type CommandPaletteContextValue = {
  registry: CommandRegistry;
  openPalette: (mode: PaletteMode) => void;
};

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  }
  return context;
};
